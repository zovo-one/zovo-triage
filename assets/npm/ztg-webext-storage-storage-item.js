import { assertChromeStorageAvailable, hasStorageValueChanged } from './ztg-webext-storage-utils.js';

class StorageItem {
    area;
    defaultValue;
    key;
    get #storage() {
        assertChromeStorageAvailable();
        return chrome.storage[this.area];
    }
    constructor(key, { area = 'local', defaultValue, } = {}) {
        this.key = key;
        this.area = area;
        this.defaultValue = defaultValue;
    }
    async get() {
        const result = await this.#storage.get(this.key);
        if (result[this.key] === undefined) {
            return this.defaultValue;
        }
        return result[this.key];
    }
    async set(value) {
        if (value === undefined) {
            await this.#storage.remove(this.key);
        }
        else {
            await this.#storage.set({ [this.key]: value });
        }
    }
    async has() {
        const result = await this.#storage.get(this.key);
        return result[this.key] !== undefined;
    }
    async remove() {
        await this.#storage.remove(this.key);
    }
    onChanged(callback, signal) {
        assertChromeStorageAvailable();
        const changeHandler = (changes, area) => {
            const changedItem = changes[this.key];
            if (area === this.area && changedItem && hasStorageValueChanged(changedItem)) {
                callback(changedItem.newValue);
            }
        };
        chrome.storage.onChanged.addListener(changeHandler);
        signal?.addEventListener('abort', () => {
            chrome.storage.onChanged.removeListener(changeHandler);
        }, {
            once: true,
        });
    }
}

export { StorageItem };
