import { queryAdditionalPermissions } from './ztg-webext-permissions.js';
import { patternToRegex } from './ztg-webext-patterns.js';

function isContentScriptStaticallyRegistered(url) {
    return Boolean(chrome.runtime
        .getManifest()
        .content_scripts
        ?.flatMap(script => script.matches)
        .some(pattern => patternToRegex(pattern).test(url)));
}
async function isContentScriptDynamicallyRegistered(url) {
    const { origins } = await queryAdditionalPermissions({
        strictOrigins: false,
    });
    return patternToRegex(...origins).test(url);
}
async function isContentScriptRegistered(url) {
    if (isContentScriptStaticallyRegistered(url)) {
        return 'static';
    }
    if (await isContentScriptDynamicallyRegistered(url)) {
        return 'dynamic';
    }
    return false;
}

export { isContentScriptDynamicallyRegistered, isContentScriptRegistered, isContentScriptStaticallyRegistered };
