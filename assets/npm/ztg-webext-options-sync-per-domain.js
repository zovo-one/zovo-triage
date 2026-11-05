import { memoizeDecorator } from './ztg-memoize.js';
import { patternToRegex } from './ztg-webext-patterns.js';
import OptionsSync from './ztg-webext-options-sync.js';
import { isBackground, isContentScript } from './ztg-webext-options-sync-per-domain-webext-detect.js';
import { normalizeManifestPermissions, queryAdditionalPermissions } from './ztg-webext-permissions.js';

var __runInitializers = (globalThis && globalThis.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (globalThis && globalThis.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
function parseHost(origin) {
    return origin.includes('//')
        ? origin.split('/')[2].replace('*.', '')
        : origin;
}
let OptionsSyncPerDomain = (() => {
    let _instanceExtraInitializers = [];
    let _getOptionsForOrigin_decorators;
    let _getAllOrigins_decorators;
    return class OptionsSyncPerDomain {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _getOptionsForOrigin_decorators = [memoizeDecorator()];
            _getAllOrigins_decorators = [memoizeDecorator()];
            __esDecorate(this, null, _getOptionsForOrigin_decorators, { kind: "method", name: "getOptionsForOrigin", static: false, private: false, access: { has: obj => "getOptionsForOrigin" in obj, get: obj => obj.getOptionsForOrigin }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _getAllOrigins_decorators, { kind: "method", name: "getAllOrigins", static: false, private: false, access: { has: obj => "getAllOrigins" in obj, get: obj => obj.getAllOrigins }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static migrations = OptionsSync.migrations;
        #defaultOrigins = (__runInitializers(this, _instanceExtraInitializers), patternToRegex(...normalizeManifestPermissions().origins));
        #defaultOptions;
        #syncedForm;
        #changeEventTarget = new EventTarget();
        constructor(options) {
            this.#defaultOptions = {
                storageName: 'options',
                ...options,
            };
            if (!isBackground()) {
                return;
            }
            if (options.migrations?.length) {
                this.getAllOrigins();
            }
            chrome.permissions.onRemoved.addListener(({ origins }) => {
                const storageKeysToRemove = (origins ?? [])
                    .filter(key => !this.#defaultOrigins.test(key))
                    .map(key => this.getStorageNameForOrigin(key));
                chrome.storage.sync.remove(storageKeysToRemove);
            });
        }
        getOptionsForOrigin(origin = location.origin) {
            if (!origin.startsWith('http') || this.#defaultOrigins.test(origin)) {
                return new OptionsSync(this.#defaultOptions);
            }
            return new OptionsSync({
                ...this.#defaultOptions,
                storageName: this.getStorageNameForOrigin(origin),
            });
        }
        async getAllOrigins() {
            if (isContentScript()) {
                throw new Error('This function only works on extension pages');
            }
            const instances = new Map();
            instances.set('default', this.getOptionsForOrigin());
            for (const { domain, origin } of await this.getAdditionalOrigins()) {
                instances.set(domain, this.getOptionsForOrigin(origin));
            }
            return instances;
        }
        async getAdditionalOrigins() {
            const { origins } = await queryAdditionalPermissions({ strictOrigins: false });
            return origins.map(origin => ({
                origin,
                domain: parseHost(origin),
            }));
        }
        async syncForm(form) {
            if (isContentScript()) {
                throw new Error('This function only works on extension pages');
            }
            if (typeof form === 'string') {
                form = document.querySelector(form);
            }
            const currentOrigin = this.getOptionsForOrigin();
            await currentOrigin.syncForm(form);
            this.#syncedForm = currentOrigin;
            const additionalOrigins = await this.getAdditionalOrigins();
            if (additionalOrigins.length === 0) {
                return Object.freeze({
                    domainCount: 1,
                    getSelectedDomain: () => 'default',
                    onChange() { },
                });
            }
            const allOrigins = ['default', ...additionalOrigins.map(item => item.domain)];
            const dropdown = document.createElement('select');
            dropdown.addEventListener('change', this._domainChangeHandler);
            for (const domain of allOrigins) {
                const option = document.createElement('option');
                option.value = domain;
                option.textContent = domain;
                dropdown.append(option);
            }
            const wrapper = document.createElement('p');
            wrapper.append('Domain selector: ', dropdown);
            wrapper.classList.add('OptionsSyncPerDomain-picker');
            form.prepend(wrapper, document.createElement('hr'));
            return Object.freeze({
                domainCount: allOrigins.length,
                getSelectedDomain: () => dropdown.value,
                onChange: (callback) => {
                    this.#changeEventTarget.addEventListener('change', () => {
                        callback(dropdown.value);
                    });
                },
            });
        }
        getStorageNameForOrigin(origin) {
            return this.#defaultOptions.storageName + '-' + parseHost(origin);
        }
        getOriginFromDomain(storageName) {
            return storageName === 'default'
                ? undefined
                : 'https://*.' + storageName + '/*';
        }
        _domainChangeHandler = async (event) => {
            const dropdown = event.currentTarget;
            const newOptions = this.getOptionsForOrigin(this.getOriginFromDomain(dropdown.value));
            this.#syncedForm.stopSyncForm();
            this.#syncedForm = newOptions;
            await newOptions.syncForm(dropdown.form);
            this.#changeEventTarget.dispatchEvent(new Event('change'));
        };
    };
})();

export { OptionsSync, OptionsSyncPerDomain as default };
