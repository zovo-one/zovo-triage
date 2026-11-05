import chromeP from './ztg-webext-polyfill-kinda.js';

const listeners = new Map();
let globalListenerAdded = false;
function isDuplicateError(error) {
    return (error.includes('Cannot create item with duplicate id')
        || error.includes('already exists in menus.create')
        || error.includes('Identifier is already used')
    );
}
function notifyOfMissingPermissions() {
    if (chrome.contextMenus) {
        return;
    }
    const manifest = chrome.runtime.getManifest();
    if (!manifest.permissions?.includes('contextMenus')
        && !/Android.+Firefox\//.test(navigator.userAgent)) {
        throw new Error('webext-permission-toggle requires the `contextMenus` permission');
    }
    console.warn('chrome.contextMenus is not available');
}
function globalListener(data, tab) {
    listeners.get(data.menuItemId)?.(data, tab);
}
async function createContextMenu(settings) {
    const { onclick, ...createSettings } = settings;
    if (!chrome.contextMenus) {
        notifyOfMissingPermissions();
        return;
    }
    if (onclick) {
        if (!globalListenerAdded) {
            chrome.contextMenus.onClicked.addListener(globalListener);
            globalListenerAdded = true;
        }
        listeners.set(createSettings.id, onclick);
    }
    const { id, ...updateSettings } = createSettings;
    const [, creation] = await Promise.allSettled([
        chromeP.contextMenus.update(id, updateSettings),
        chromeP.contextMenus.create(createSettings),
    ]);
    if (creation.status === 'rejected'
        && !isDuplicateError(String(creation.reason))) {
        throw creation.reason;
    }
}

export { createContextMenu as default, notifyOfMissingPermissions };
