import castTarget from './ztg-webext-tools-target.js';

async function getTabUrl(target) {
    const { frameId, tabId } = castTarget(target);
    try {
        if (frameId === 0 && 'tabs' in globalThis.chrome) {
            const tab = await chrome.tabs.get(tabId);
            if (tab.url) {
                return tab.url;
            }
        }
        const [result] = await chrome.scripting.executeScript({
            target: { tabId, frameIds: [frameId] },
            func: () => location.href,
        });
        return result?.result;
    }
    catch {
        return undefined;
    }
}

export { getTabUrl as default };
