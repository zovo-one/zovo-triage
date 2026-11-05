const createListener = (handle) => function () {
    if (typeof handle === 'function') {
        handle(this.reason);
    }
    else if ('disconnect' in handle) {
        handle.disconnect();
    }
    else if ('abort' in handle) {
        handle.abort(this.reason);
    }
    else if ('abortAndReset' in handle) {
        handle.abortAndReset(this.reason);
    }
    else {
        throw new TypeError('Invalid AbortSignal handle type');
    }
};
function onAbort(signal, ...handles) {
    if (!signal || handles.length === 0) {
        return;
    }
    const cleanup = new AbortController();
    const inputSignal = signal instanceof AbortController ? signal.signal : signal;
    const preAbortedHelper = new AbortController();
    const targetSignal = inputSignal.aborted
        ? preAbortedHelper.signal
        : inputSignal;
    for (const handle of handles) {
        targetSignal.addEventListener('abort', createListener(handle), {
            once: true,
            signal: cleanup.signal,
        });
    }
    if (inputSignal.aborted) {
        preAbortedHelper.abort(inputSignal.reason);
    }
    return {
        [Symbol.dispose]: cleanup.abort.bind(cleanup),
    };
}

export { onAbort };
