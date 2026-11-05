async function watch(promise, controller) {
    try {
        await promise;
    }
    catch {
    }
    finally {
        controller.abort();
    }
}
function signalFromPromise(promise) {
    const controller = new AbortController();
    void watch(promise, controller);
    return controller.signal;
}

export { signalFromPromise };
