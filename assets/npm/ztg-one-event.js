async function oneEvent(target, typeOrTypes, options = {}) {
    const { filter, ...nativeOptions } = options;
    return new Promise((resolve, reject) => {
        const controller = new AbortController();
        const callback = (event) => {
            if (filter && !filter(event)) {
                return;
            }
            controller.abort();
            resolve(event);
        };
        for (const type of [typeOrTypes].flat()) {
            target.addEventListener(type, callback, {
                ...nativeOptions,
                signal: controller.signal,
            });
        }
        nativeOptions.signal?.addEventListener('abort', () => {
            controller.abort();
            reject(nativeOptions.signal.reason);
        }, { once: true });
    });
}

export { oneEvent as default };
