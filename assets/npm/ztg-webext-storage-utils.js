function assertChromeStorageAvailable() {
    if (!globalThis.chrome?.storage) {
        throw new TypeError('`chrome.storage` is not available. Make sure you\'re running in a browser extension context.');
    }
}
function hasStorageValueChanged(change) {
    return !globalThis.navigator?.userAgent.includes('Firefox')
        || JSON.stringify(change.newValue) !== JSON.stringify(change.oldValue);
}

export { assertChromeStorageAvailable, hasStorageValueChanged };
