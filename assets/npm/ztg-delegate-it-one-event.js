import delegate from './ztg-delegate-it-delegate.js';

async function oneEvent(selector, type, options = {}) {
    return new Promise(resolve => {
        const { filter, ...delegateOptions } = options;
        if (delegateOptions.signal?.aborted) {
            resolve(undefined);
            return;
        }
        if (filter) {
            const controller = new AbortController();
            delegateOptions.signal?.addEventListener('abort', () => {
                controller.abort();
                resolve(undefined);
            });
            delegate(selector, type, event => {
                if (filter(event)) {
                    controller.abort();
                    resolve(event);
                }
            }, { ...delegateOptions, signal: controller.signal });
        }
        else {
            delegateOptions.signal?.addEventListener('abort', () => {
                resolve(undefined);
            });
            delegate(selector, type, resolve, { ...delegateOptions, once: true });
        }
    });
}

export { oneEvent as default };
