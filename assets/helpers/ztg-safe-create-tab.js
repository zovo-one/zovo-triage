import { isMobileFirefox } from '../npm/ztg-webext-detect.js';

async function safeCreateTab(properties) {
	// No support there https://stackoverflow.com/a/42422254
	if (properties.openerTabId && isMobileFirefox()) {
		delete properties.openerTabId;
	}

	// eslint-disable-next-line byo/prefer-safe-create-tab -- Rule points to this function
	return chrome.tabs.create(properties);
}

export { safeCreateTab as default };
