const isChrome = () => globalThis.navigator?.userAgent.includes('Chrome');
const isSafari = () => !isChrome() && globalThis.navigator?.userAgent.includes('Safari');

export { isChrome, isSafari };
