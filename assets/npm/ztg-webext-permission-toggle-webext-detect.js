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
const isBackground = () => isBackgroundPage() || isBackgroundWorker();
const isBackgroundPage = once(() => {
    const manifest = getManifest();
    if (!manifest) {
        return false;
    }
    if (isCurrentPathname(manifest.background_page ?? manifest.background?.page)) {
        return true;
    }
    return Boolean(manifest.background?.scripts
        && isCurrentPathname('/_generated_background_page.html'));
});
const isBackgroundWorker = once(() => isCurrentPathname(getManifest()?.background?.service_worker));

export { isBackground, isBackgroundPage, isBackgroundWorker };
