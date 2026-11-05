async function oneEvent(event, { filter, signal, } = {}) {
    if (signal?.aborted) {
        return;
    }
    return new Promise(resolve => {
        const listener = (...parameters) => {
            if (!filter || filter(...parameters)) {
                resolve(parameters);
                event.removeListener(listener);
            }
        };
        event.addListener(listener);
        signal?.addEventListener('abort', () => {
            resolve();
            event.removeListener(listener);
        });
    });
}

export { oneEvent };
