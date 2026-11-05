import { queryAdditionalPermissions } from './ztg-webext-permissions.js';
import { onExtensionStart } from './ztg-webext-events-on-extension-start.js';
import { excludeDuplicateFiles } from './ztg-webext-dynamic-content-scripts-deduplicator.js';
import { injectToExistingTabs } from './ztg-webext-dynamic-content-scripts-inject-to-existing-tabs.js';
import { registerContentScript } from './ztg-webext-dynamic-content-scripts-register-content-script-shim.js';

const registeredScripts = new Map();
function makePathRelative(file) {
    return new URL(file, location.origin).pathname;
}
function getContentScripts() {
    const { content_scripts: rawManifest, manifest_version: manifestVersion } = chrome.runtime.getManifest();
    if (!rawManifest) {
        throw new Error('webext-dynamic-content-scripts tried to register scripts on the new host permissions, but no content scripts were found in the manifest.');
    }
    return excludeDuplicateFiles(rawManifest, { warn: manifestVersion === 2 });
}
async function registerOnOrigins(origins, contentScripts) {
    if (origins.length === 0) {
        return;
    }
    for (const origin of origins) {
        for (const config of contentScripts) {
            const registeredScript = registerContentScript({
                js: config.js?.map(file => makePathRelative(file)),
                css: config.css?.map(file => makePathRelative(file)),
                allFrames: config.all_frames,
                matches: [origin],
                excludeMatches: config.matches,
                runAt: config.run_at,
            });
            registeredScripts.set(origin, registeredScript);
        }
    }
}
async function handleNewPermissions({ origins }) {
    await enableOnOrigins(origins);
}
async function handledDroppedPermissions({ origins }) {
    if (!origins?.length) {
        return;
    }
    for (const [origin, scriptPromise] of registeredScripts) {
        if (origins.includes(origin)) {
            const script = await scriptPromise;
            void script.unregister();
        }
    }
}
async function enableOnOrigins(origins) {
    if (!origins?.length) {
        return;
    }
    const contentScripts = getContentScripts();
    await Promise.all([
        injectToExistingTabs(origins, contentScripts),
        registerOnOrigins(origins, contentScripts),
    ]);
}
async function registerExistingOrigins() {
    const { origins } = await queryAdditionalPermissions({
        strictOrigins: false,
    });
    await enableOnOrigins(origins);
}
function init() {
    chrome.permissions.onRemoved.addListener(handledDroppedPermissions);
    chrome.permissions.onAdded.addListener(handleNewPermissions);
    onExtensionStart.addListener(registerExistingOrigins);
}

export { init };
