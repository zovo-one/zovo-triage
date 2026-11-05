import toMilliseconds from './ztg-@sindresorhus-to-milliseconds.js';
import { timeInTheFuture, readItem, writeItem, deleteItem } from './ztg-webext-storage-cache-shared.js';

function getUserKey(name, cacheKey, arguments_) {
    if (!cacheKey) {
        if (arguments_.length === 0) {
            return name;
        }
        cacheKey = JSON.stringify;
    }
    return `${name}:${cacheKey(arguments_)}`;
}
class CachedFunction {
    #updater;
    #cacheKey;
    #shouldRevalidate;
    #inFlight = new Map();
    #totalMaxAge;
    maxAge;
    staleWhileRevalidate;
    get = (async (...arguments_) => {
        const { userKey, cached } = await this.#readCached(arguments_);
        if (!cached || this.#shouldRevalidate?.(cached.data)) {
            return this.#updateOnce(userKey, arguments_);
        }
        if (timeInTheFuture(this.staleWhileRevalidate) > cached.maxAge) {
            setTimeout(() => {
                this.#updateOnce(userKey, arguments_).catch(() => undefined);
            }, 0);
        }
        return cached.data;
    });
    name;
    constructor(name, options) {
        this.name = name;
        this.#cacheKey = options.cacheKey;
        this.#updater = options.updater;
        this.#shouldRevalidate = options.shouldRevalidate;
        this.maxAge = options.maxAge ?? { days: 30 };
        this.staleWhileRevalidate = options.staleWhileRevalidate ?? { days: 0 };
        this.#totalMaxAge = { milliseconds: toMilliseconds(this.maxAge) + toMilliseconds(this.staleWhileRevalidate) };
    }
    #getUserKey(arguments_) {
        return getUserKey(this.name, this.#cacheKey, arguments_);
    }
    async #readCached(arguments_) {
        const userKey = this.#getUserKey(arguments_);
        return { userKey, cached: await readItem(userKey) };
    }
    async #refresh(userKey, arguments_) {
        const freshValue = await this.#updater(...arguments_);
        return writeItem(userKey, freshValue, this.#totalMaxAge);
    }
    async #updateOnce(userKey, arguments_) {
        let promise = this.#inFlight.get(userKey);
        if (!promise) {
            promise = this.#refresh(userKey, arguments_);
            this.#inFlight.set(userKey, promise);
            const clear = () => {
                this.#inFlight.delete(userKey);
            };
            promise.then(clear, clear);
        }
        return promise;
    }
    async getCached(...arguments_) {
        const { cached } = await this.#readCached(arguments_);
        return cached?.data;
    }
    async setCached(value, ...arguments_) {
        if (arguments.length === 0) {
            throw new TypeError('Expected a value to be stored');
        }
        const userKey = this.#getUserKey(arguments_);
        return writeItem(userKey, value, this.#totalMaxAge);
    }
    async getFresh(...arguments_) {
        const userKey = this.#getUserKey(arguments_);
        return this.#refresh(userKey, arguments_);
    }
    async delete(...arguments_) {
        const userKey = this.#getUserKey(arguments_);
        await deleteItem(userKey);
    }
    async isCached(...arguments_) {
        const { cached } = await this.#readCached(arguments_);
        return cached !== undefined;
    }
}

export { CachedFunction as default };
