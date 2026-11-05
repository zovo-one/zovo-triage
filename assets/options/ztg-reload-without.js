import webextAlert from '../npm/ztg-webext-alert.js';
import { isContentScriptRegistered } from '../npm/ztg-webext-dynamic-content-scripts-utils.js';
import { StorageItem } from '../npm/ztg-webext-storage-storage-item.js';
import createContextMenu from '../npm/ztg-webext-tools-create-context-menu.js';

// Always Firefox… https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/storage/StorageArea/setAccessLevel
// Don't use `isFirefox` - #9065
const area = chrome.storage.session?.setAccessLevel === undefined ? 'local' : 'session';

const contentScriptToggle = new StorageItem('contentScript', {
	area,
	defaultValue: true,
});

async function reload(_, tab) {
	if (tab.id && tab.url && await isContentScriptRegistered(tab.url)) {
		await contentScriptToggle.set(false);
		await chrome.tabs.reload(tab.id);
	} else {
		// TODO: Use https://github.com/fregante/webext-events/issues/31 to disable the item instead
		await webextAlert('Refined GitHub is already not running on this page');
	}
}

function addReloadWithoutContentScripts() {
	void chrome.storage.session.setAccessLevel?.({accessLevel: 'TRUSTED_AND_UNTRUSTED_CONTEXTS'});

	void createContextMenu({
		id: 'reload-without-content-scripts',
		title: 'Reload without Refined GitHub',
		contexts: ['action'],
		onclick: reload,
	});
}

export { contentScriptToggle, addReloadWithoutContentScripts as default };
