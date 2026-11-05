import mimicFunction from './ztg-mimic-function.js';

const maxTimeoutValue = 2_147_483_647;
const cacheStore = new WeakMap();
const cacheTimerStore = new WeakMap();
const cacheKeyStore = new WeakMap();
function getValidCacheItem(cache, key) {
    const item = cache.get(key);
    if (!item) {
        return undefined;
    }
    if (item.maxAge <= Date.now()) {
        cache.delete(key);
        return undefined;
    }
    return item;
}
function validateMaxAge(value, source) {
    if (value === Number.POSITIVE_INFINITY) {
        return;
    }
    if (!Number.isFinite(value)) {
        if (source === '`maxAge` option') {
            throw new TypeError('The `maxAge` option must be a finite number, `0`, or `Infinity`.');
        }
        throw new TypeError('The `maxAge` function must return a finite number, `0`, or `Infinity`.');
    }
    if (value > maxTimeoutValue) {
        if (source === '`maxAge` option') {
            throw new TypeError(`The \`maxAge\` option cannot exceed ${maxTimeoutValue}.`);
        }
        throw new TypeError(`The \`maxAge\` function result cannot exceed ${maxTimeoutValue}.`);
    }
}
function getPropertyDescriptor(object, property) {
    let currentObject = object;
    while (currentObject) {
        const descriptor = Object.getOwnPropertyDescriptor(currentObject, property);
        if (descriptor) {
            return descriptor;
        }
        const prototype = Object.getPrototypeOf(currentObject);
        currentObject = prototype === null ? undefined : prototype;
    }
    return undefined;
}
function memoize(function_, { cacheKey, cache = new Map(), maxAge, } = {}) {
    if (typeof maxAge === 'number') {
        validateMaxAge(maxAge, '`maxAge` option');
        if (maxAge <= 0) {
            return function_;
        }
    }
    const memoized = function (...arguments_) {
        const key = cacheKey ? cacheKey(arguments_) : arguments_[0];
        const cacheItem = getValidCacheItem(cache, key);
        if (cacheItem) {
            return cacheItem.data;
        }
        const result = function_.apply(this, arguments_);
        const computedMaxAge = typeof maxAge === 'function' ? maxAge(...arguments_) : maxAge;
        if (computedMaxAge !== undefined && computedMaxAge !== Number.POSITIVE_INFINITY) {
            validateMaxAge(computedMaxAge, '`maxAge` function result');
            if (computedMaxAge <= 0) {
                return result;
            }
        }
        cache.set(key, {
            data: result,
            maxAge: (computedMaxAge === undefined || computedMaxAge === Number.POSITIVE_INFINITY)
                ? Number.POSITIVE_INFINITY
                : Date.now() + computedMaxAge,
        });
        if (computedMaxAge !== undefined && computedMaxAge !== Number.POSITIVE_INFINITY) {
            const timer = setTimeout(() => {
                cache.delete(key);
                cacheTimerStore.get(memoized)?.delete(timer);
            }, computedMaxAge);
            timer.unref?.();
            const timers = cacheTimerStore.get(memoized) ?? new Set();
            timers.add(timer);
            cacheTimerStore.set(memoized, timers);
        }
        return result;
    };
    mimicFunction(memoized, function_, {
        ignoreNonConfigurable: true,
    });
    cacheStore.set(memoized, cache);
    cacheKeyStore.set(memoized, (cacheKey ?? ((arguments_) => arguments_[0])));
    return memoized;
}
function memoizeDecorator(options = {}) {
    function decorator(target, context) {
        if (context.kind === 'method') {
            if (context.private) {
                throw new TypeError('The `memoizeDecorator` method decorator does not support private methods.');
            }
            const memoizedMethods = new WeakMap();
            const getMemoizedMethod = (receiver) => {
                let memoizedMethod = memoizedMethods.get(receiver);
                if (!memoizedMethod) {
                    memoizedMethod = memoize(target.bind(receiver), options);
                    memoizedMethods.set(receiver, memoizedMethod);
                }
                return memoizedMethod;
            };
            const installMethod = (receiver, method) => {
                Object.defineProperty(receiver, context.name, {
                    configurable: true,
                    enumerable: false,
                    value: method,
                    writable: true,
                });
                return method;
            };
            const installStaticMethodGetter = (receiver) => {
                Object.defineProperty(receiver, context.name, {
                    configurable: true,
                    enumerable: false,
                    get() {
                        const currentReceiver = this;
                        if (currentReceiver !== receiver) {
                            const currentPrototype = Object.getPrototypeOf(currentReceiver);
                            if (currentPrototype === receiver
                                && !Object.hasOwn(currentReceiver, context.name)) {
                                installStaticMethodGetter(currentReceiver);
                            }
                        }
                        return getMemoizedMethod(currentReceiver);
                    },
                });
            };
            const decoratedMethod = function (...arguments_) {
                return getMemoizedMethod(this)(...arguments_);
            };
            mimicFunction(decoratedMethod, target, {
                ignoreNonConfigurable: true,
            });
            if (context.static) {
                context.addInitializer(function () {
                    installStaticMethodGetter(this);
                });
            }
            else {
                context.addInitializer(function () {
                    const receiver = this;
                    const descriptor = getPropertyDescriptor(Object.getPrototypeOf(receiver), context.name);
                    if (descriptor?.value !== decoratedMethod) {
                        return;
                    }
                    installMethod(receiver, getMemoizedMethod(receiver));
                });
            }
            return decoratedMethod;
        }
        const memoizedGetters = new WeakMap();
        return function () {
            let memoizedGetter = memoizedGetters.get(this);
            if (!memoizedGetter) {
                memoizedGetter = memoize(() => target.call(this), options);
                memoizedGetters.set(this, memoizedGetter);
            }
            return memoizedGetter();
        };
    }
    return decorator;
}

export { memoize as default, memoizeDecorator };
