import { debounce } from './ztg-throttle-debounce.js';
import chromeP from './ztg-webext-polyfill-kinda.js';
import { isBackground } from './ztg-webext-options-sync-webext-detect.js';
import { deserialize, serialize } from './ztg-dom-form-serializer-dom-form-serializer.js';
import LZString from '../_virtual/ztg-lz-string.js';
import { onContextInvalidated } from './ztg-webext-events-on-context-invalidated.js';
import './ztg-webext-events-on-extension-start.js';
import { loadFile, saveFile } from './ztg-webext-options-sync-file.js';

const { compressToEncodedURIComponent, decompressFromEncodedURIComponent } = LZString;
function alertAndThrow(message) {
    alert(message);
    throw new Error(message);
}
async function shouldRunMigrations() {
    const self = await chromeP.management?.getSelf();
    if (self?.installType === 'development') {
        return true;
    }
    return new Promise(resolve => {
        chrome.runtime.onInstalled.addListener(() => {
            resolve(true);
        });
        setTimeout(resolve, 500, false);
    });
}
class OptionsSync {
    static migrations = {
        removeUnused(options, defaults) {
            for (const key of Object.keys(options)) {
                if (!(key in defaults)) {
                    delete options[key];
                }
            }
        },
    };
    storageName;
    storageType;
    defaults;
    _form;
    _migrations;
    constructor({
    defaults = {}, storageName = 'options', migrations = [], logging = true, storageType = 'sync', } = {}) {
        this.storageName = storageName;
        this.defaults = defaults;
        this.storageType = storageType;
        if (!logging) {
            this._log = () => { };
        }
        this._migrations = this._runMigrations(migrations);
    }
    get storage() {
        return chromeP.storage[this.storageType];
    }
    async getAll() {
        await this._migrations;
        return this._getAll();
    }
    async setAll(newOptions) {
        await this._migrations;
        return this._setAll(newOptions);
    }
    async set(newOptions) {
        return this.setAll({ ...await this.getAll(), ...newOptions });
    }
    async syncForm(form) {
        this.stopSyncForm();
        this._form = form instanceof HTMLFormElement
            ? form
            : document.querySelector(form);
        this._form.addEventListener('input', this._handleFormInput);
        this._form.addEventListener('submit', this._handleFormSubmit);
        chrome.storage.onChanged.addListener(this._handleStorageChangeOnForm);
        this._updateForm(this._form, await this.getAll());
        this._form.querySelector('.js-export')?.addEventListener('click', this.exportToFile);
        this._form.querySelector('.js-import')?.addEventListener('click', this.importFromFile);
        onContextInvalidated.addListener(() => {
            location.reload();
        });
    }
    stopSyncForm() {
        if (this._form) {
            this._form.removeEventListener('input', this._handleFormInput);
            this._form.removeEventListener('submit', this._handleFormSubmit);
            this._form.querySelector('.js-export')?.removeEventListener('click', this.exportToFile);
            this._form.querySelector('.js-import')?.removeEventListener('click', this.importFromFile);
            chrome.storage.onChanged.removeListener(this._handleStorageChangeOnForm);
            delete this._form;
        }
    }
    get _jsonIdentityHelper() {
        return '__webextOptionsSync';
    }
    importFromFile = async () => {
        const text = await loadFile();
        let options;
        try {
            options = JSON.parse(text);
        }
        catch {
            alertAndThrow('The file is not a valid JSON file.');
        }
        if (!(this._jsonIdentityHelper in options)) {
            alertAndThrow('The file selected is not a valid recognized options file.');
        }
        delete options[this._jsonIdentityHelper];
        await this.set(options);
        if (this._form) {
            this._updateForm(this._form, options);
        }
    };
    exportToFile = async () => {
        const extension = chrome.runtime.getManifest();
        const text = JSON.stringify({
            [this._jsonIdentityHelper]: extension.name,
            ...await this.getAll(),
        }, null, '\t');
        await saveFile(text, extension.name + ' options.json');
    };
    onChanged(callback, signal) {
        const onChanged = (changes, area) => {
            const data = changes[this.storageName];
            if (data && area === this.storageType) {
                callback(this._decode(data.newValue), this._decode(data.oldValue ?? {}));
            }
        };
        chrome.storage.onChanged.addListener(onChanged);
        signal?.addEventListener('abort', () => {
            chrome.storage.onChanged.removeListener(onChanged);
        });
    }
    _log(method, ...arguments_) {
        console[method](...arguments_);
    }
    async _getAll() {
        const result = await this.storage.get(this.storageName);
        return this._decode(result[this.storageName]);
    }
    async _setAll(newOptions) {
        this._log('log', 'Saving options', newOptions);
        await this.storage.set({
            [this.storageName]: this._encode(newOptions),
        });
    }
    _encode(options) {
        const thinnedOptions = { ...options };
        for (const [key, value] of Object.entries(thinnedOptions)) {
            if (this.defaults[key] === value) {
                delete thinnedOptions[key];
            }
        }
        this._log('log', 'Without the default values', thinnedOptions);
        return compressToEncodedURIComponent(JSON.stringify(thinnedOptions));
    }
    _decode(options) {
        let decompressed = options;
        if (typeof options === 'string') {
            decompressed = JSON.parse(decompressFromEncodedURIComponent(options));
        }
        return { ...this.defaults, ...decompressed };
    }
    async _runMigrations(migrations) {
        if (migrations.length === 0 || !isBackground() || !await shouldRunMigrations()) {
            return;
        }
        const options = await this._getAll();
        const initial = JSON.stringify(options);
        this._log('log', 'Found these stored options', { ...options });
        this._log('info', 'Will run', migrations.length, migrations.length === 1 ? 'migration' : ' migrations');
        for (const migrate of migrations) {
            await migrate(options, this.defaults);
        }
        if (initial !== JSON.stringify(options)) {
            await this._setAll(options);
        }
    }
    _handleFormInput = debounce(300, async ({ target }) => {
        const field = target;
        if (!field.name) {
            return;
        }
        try {
            await this.set(this._parseForm(field.form));
        }
        catch (error) {
            field.dispatchEvent(new CustomEvent('options-sync:save-error', {
                bubbles: true,
                detail: error,
            }));
            throw error;
        }
        field.dispatchEvent(new CustomEvent('options-sync:save-success', {
            bubbles: true,
        }));
        field.form.dispatchEvent(new CustomEvent('options-sync:form-synced', {
            bubbles: true,
        }));
    });
    _handleFormSubmit(event) {
        event.preventDefault();
    }
    _updateForm(form, options) {
        const currentFormState = this._parseForm(form);
        for (const [key, value] of Object.entries(options)) {
            if (currentFormState[key] === value) {
                delete options[key];
            }
        }
        const include = Object.keys(options);
        if (include.length > 0) {
            deserialize(form, options, { include });
        }
    }
    _parseForm(form) {
        const include = [];
        for (const field of form.querySelectorAll('[name]')) {
            if (field.validity.valid && !field.disabled) {
                include.push(field.name.replace(/\[.*]/, ''));
            }
        }
        return serialize(form, { include });
    }
    _handleStorageChangeOnForm = (changes, areaName) => {
        if (areaName === this.storageType
            && this.storageName in changes
            && (!document.hasFocus() || !this._form.contains(document.activeElement))
        ) {
            this._updateForm(this._form, this._decode(changes[this.storageName].newValue));
        }
    };
}

export { OptionsSync as default };
