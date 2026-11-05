function signalFromEvent(target, event, { filter, ...options } = {}) {
    const controller = new AbortController();
    const listener = filter
        ? async (event) => {
            let shouldAbort = filter(event);
            if (typeof shouldAbort === 'object' && 'then' in shouldAbort) {
                shouldAbort = await shouldAbort;
            }
            if (shouldAbort) {
                controller.abort(event);
            }
        }
        : () => {
            controller.abort();
        };
    target.addEventListener(event, listener, {
        ...options,
        once: !filter,
    });
    return controller.signal;
}

export { signalFromEvent };
