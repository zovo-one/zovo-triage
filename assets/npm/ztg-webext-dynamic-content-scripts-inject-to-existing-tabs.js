import { injectContentScript, getTabsByUrl } from './ztg-webext-content-scripts.js';

async function injectToExistingTabs(origins, scripts) {
    const excludeMatches = scripts.flatMap(script => script.matches ?? []);
    return injectContentScript(await getTabsByUrl(origins, excludeMatches), scripts, { ignoreTargetErrors: true });
}

export { injectToExistingTabs };
