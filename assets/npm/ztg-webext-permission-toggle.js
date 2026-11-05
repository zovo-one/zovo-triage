import { isBackground } from './ztg-webext-permission-toggle-webext-detect.js';
import { isUrlPermittedByManifest } from './ztg-webext-permissions.js';
import { findMatchingPatterns } from './ztg-webext-patterns.js';
import createContextMenu, { notifyOfMissingPermissions } from './ztg-webext-tools-create-context-menu.js';
import getTabUrl from './ztg-webext-tools-get-tab-url.js';
import webextAlert from './ztg-webext-alert.js';
import { isScriptableUrl, executeFunction } from './ztg-webext-content-scripts.js';

const contextMenuId = 'webext-permission-toggle:add-permission';
let globalOptions;
function assertTab(tab) {
    if (!tab?.id) {
        throw new Error('The browser didn\'t supply any information about the active tab.');
    }
}
function assertUrl(url) {
    if (!url) {
        throw new Error('The browser didn\'t supply the current page\'s URL.');
    }
}
function assertScriptableUrl(url) {
    if (!isScriptableUrl(url)) {
        throw new Error(chrome.runtime.getManifest().name + ' can\'t be enabled on this page.');
    }
}
async function isOriginPermanentlyAllowed(origin) {
    return chrome.permissions.contains({
        origins: [origin + '/*'],
    });
}
function updateItemRaw({ checked, enabled }) {
    void chrome.contextMenus.update(contextMenuId, {
        checked,
        enabled,
    });
}
async function updateItem(url) {
    if (!url) {
        updateItemRaw({
            enabled: true,
            checked: false,
        });
        return;
    }
    if (isScriptableUrl(url)) {
        const { origin } = new URL(url);
        const isDefault = isUrlPermittedByManifest(url);
        const hasPermission = await isOriginPermanentlyAllowed(origin);
        updateItemRaw({
            enabled: !isDefault || !hasPermission,
            checked: hasPermission,
        });
        return;
    }
    updateItemRaw({
        enabled: false,
        checked: false,
    });
}
async function setPermission(url, request) {
    const permissionData = {
        origins: [
            new URL(url).origin + '/*',
        ],
    };
    if (request) {
        await chrome.permissions.request(permissionData);
    }
    else {
        const { origins = [] } = await chrome.permissions.getAll();
        const matchingPatterns = findMatchingPatterns(url, ...origins);
        console.debug('Removing permissions:', ...matchingPatterns);
        await chrome.permissions.remove({
            origins: matchingPatterns,
        });
    }
    return chrome.permissions.contains(permissionData);
}
async function handleTabActivated({ tabId }) {
    void updateItem(await getTabUrl(tabId) ?? '');
}
async function handleWindowFocusChanged(windowId) {
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        return;
    }
    const [tab] = await chrome.tabs.query({
        active: true,
        windowId,
    });
    void updateItem(tab?.url);
}
async function handleClick({ checked, menuItemId }, tab) {
    if (menuItemId !== contextMenuId) {
        return;
    }
    let url;
    try {
        assertTab(tab);
        url = tab.url || await getTabUrl(tab.id);
        assertUrl(url);
        assertScriptableUrl(url);
        const permissionExistsNow = await setPermission(url, checked);
        const settingWasSuccessful = permissionExistsNow === checked;
        if (!settingWasSuccessful) {
            updateItemRaw({
                checked: permissionExistsNow,
            });
        }
        if (permissionExistsNow && globalOptions.reloadOnSuccess) {
            void executeFunction(tab.id, (message) => {
                if (confirm(message)) {
                    location.reload();
                }
            }, globalOptions.reloadOnSuccess);
        }
    }
    catch (error) {
        setTimeout(updateItem, 500, url);
        if (tab?.id) {
            try {
                await executeFunction(tab.id, text => {
                    globalThis.alert(text);
                }, String(error));
            }
            catch {
                void webextAlert(String(error));
            }
        }
        throw error;
    }
}
function getOptionalHosts(manifest = chrome.runtime.getManifest()) {
    return [
        ...manifest.optional_permissions ?? [],
        ...manifest.optional_host_permissions ?? [],
    ].filter((permission) => permission === '<all_urls>' || permission.includes('*'));
}
function addPermissionToggle(options) {
    if (!isBackground()) {
        throw new Error('webext-permission-toggle can only be called from a background page');
    }
    if (globalOptions) {
        throw new Error('webext-permission-toggle can only be initialized once');
    }
    if (!chrome.contextMenus) {
        notifyOfMissingPermissions();
        return;
    }
    const manifest = chrome.runtime.getManifest();
    const optionalHosts = getOptionalHosts(manifest);
    if (optionalHosts.length === 0) {
        throw new TypeError('webext-permission-toggle requires some wildcard hosts to be specified `optional_host_permissions`');
    }
    globalOptions = {
        title: `Enable ${manifest.name} on this domain`,
        reloadOnSuccess: false,
        ...options,
    };
    if (globalOptions.reloadOnSuccess === true) {
        globalOptions.reloadOnSuccess = `Do you want to reload this page to apply ${manifest.name}?`;
    }
    chrome.tabs.onActivated.addListener(handleTabActivated);
    chrome.windows?.onFocusChanged.addListener(handleWindowFocusChanged);
    chrome.tabs.onUpdated.addListener(async (tabId, { status }, { url, active }) => {
        if (active && status === 'complete') {
            void updateItem(url ?? await getTabUrl(tabId) ?? '');
        }
    });
    void createContextMenu({
        id: contextMenuId,
        type: 'checkbox',
        checked: false,
        title: globalOptions.title,
        contexts: ['action'],
        onclick: handleClick,
        documentUrlPatterns: optionalHosts,
    });
}
function hasRequiredPermissions() {
    return Boolean(chrome.contextMenus && getOptionalHosts().length > 0);
}

export { addPermissionToggle as default, hasRequiredPermissions };
