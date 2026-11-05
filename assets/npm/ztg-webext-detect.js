function isCurrentPathname(path) {
    if (!path) {
        return false;
    }
    try {
        const { pathname } = new URL(path, location.origin);
        return pathname === location.pathname;
    }
    catch {
        return false;
    }
}
function getManifest(_version) {
    return globalThis.chrome?.runtime?.getManifest?.();
}
function once(function_) {
    let result;
    return () => {
        if (result === undefined) {
            result = function_();
        }
        return result;
    };
}
const isWebPage = once(() => ['about:', 'http:', 'https:'].includes(location.protocol));
const isBackground = () => isBackgroundPage() || isBackgroundWorker();
const isBackgroundPage = once(() => {
    const manifest = getManifest();
    if (!manifest) {
        return false;
    }
    if (isCurrentPathname(manifest.background?.page)) {
        return true;
    }
    return Boolean(manifest.background?.scripts
        && isCurrentPathname('/_generated_background_page.html'));
});
const isBackgroundWorker = once(() => isCurrentPathname(getManifest()?.background?.service_worker));
const isAndroid = () => globalThis.navigator?.userAgent.includes('Android');
const isFirefox = () => globalThis.navigator?.userAgent.includes('Firefox');
const isChrome = () => globalThis.navigator?.userAgent.includes('Chrome');
const isSafari = () => !isChrome() && globalThis.navigator?.userAgent.includes('Safari');
const isMobileFirefox = () => isFirefox() && isAndroid();

export { isAndroid, isBackground, isBackgroundPage, isBackgroundWorker, isChrome, isFirefox, isMobileFirefox, isSafari, isWebPage };
