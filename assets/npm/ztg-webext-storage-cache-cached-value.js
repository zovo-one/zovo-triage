import { readItem, writeItem, deleteItem } from './ztg-webext-storage-cache-shared.js';

class CachedValue {
    maxAge;
    name;
    constructor(name, options = {}) {
        this.name = name;
        this.maxAge = options.maxAge ?? { days: 30 };
    }
    async get() {
        const item = await readItem(this.name);
        return item?.data;
    }
    async set(value) {
        if (arguments.length === 0) {
            throw new TypeError('Expected a value to be stored');
        }
        return writeItem(this.name, value, this.maxAge);
    }
    async delete() {
        await deleteItem(this.name);
    }
    async isCached() {
        return (await readItem(this.name)) !== undefined;
    }
}

export { CachedValue as default };
