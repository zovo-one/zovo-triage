import webextAlert from '../npm/ztg-webext-alert.js';
import { isContentScriptRegistered } from '../npm/ztg-webext-dynamic-content-scripts-utils.js';
import createContextMenu from '../npm/ztg-webext-tools-create-context-menu.js';
import { startFeatureIdentification } from '../helpers/ztg-bisect.js';

async function confirmAndReload(_menuInfo, tab) {
	if (tab.id && tab.url && await isContentScriptRegistered(tab.url)) {
		await startFeatureIdentification(new URL(tab.url).origin);
		await chrome.tabs.reload(tab.id);
	} else {
		await webextAlert('Refined GitHub is not running on this page');
	}
}

function addIdentifyFeatureContextMenu() {
	void createContextMenu({
		id: 'identify-feature',
		title: 'Reload page and identify feature…',
		contexts: ['action'],
		onclick: confirmAndReload,
	});
}

export { addIdentifyFeatureContextMenu as default };
