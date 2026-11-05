import './npm/ztg-webext-dynamic-content-scripts.js';
import './npm/ztg-webext-bugs-options-menu-item.js';
import { customizeNoAllUrlsErrorMessage } from './npm/ztg-webext-bugs-no-all-urls.js';
import { handleMessages } from './npm/ztg-webext-msg.js';
import addPermissionToggle, { hasRequiredPermissions } from './npm/ztg-webext-permission-toggle.js';
import { StorageItem } from './npm/ztg-webext-storage-storage-item.js';
import { globalCache } from './npm/ztg-webext-storage-cache.js';
import { doesBrowserActionOpenOptions } from './helpers/ztg-feature-utils.js';
import { styleHotfixes } from './helpers/ztg-hotfix.js';
import isDevelopmentVersion from './helpers/ztg-is-development-version.js';
import { fetchText } from './helpers/ztg-isomorphic-fetch.js';
import safeCreateTab from './helpers/ztg-safe-create-tab.js';
import optionsStorage, { hasToken } from './ztg-options-storage.js';
import addIdentifyFeatureContextMenu from './options/ztg-identify-feature.js';
import addReloadWithoutContentScripts from './options/ztg-reload-without.js';
import { verifyLicense, LICENSE_ALARM, ENTITLEMENT_KEY } from './triage/ztg-license.js';

// eslint-disable-next-line import-x/no-unassigned-import -- Side effects

const {version} = chrome.runtime.getManifest();

const welcomeShown = new StorageItem('welcomed', {defaultValue: false});

// GHE support
if (hasRequiredPermissions()) {
	addPermissionToggle();
}

// Add "Reload without content scripts" functionality
addReloadWithoutContentScripts();
addIdentifyFeatureContextMenu();

// Extend the error message for the "No All URLs" bugfix
customizeNoAllUrlsErrorMessage(
	'Refined GitHub is not meant to run on every website. If you’re looking to enable it on GitHub Enterprise, follow the instructions in the Options page.',
);

handleMessages({
	async ping() {
		return 'pong';
	},
	async openUrls(urls, {tab}) {
		for (const url of urls) {
			void safeCreateTab({
				url,
				openerTabId: tab.id,
				active: false,
			});
		}
	},
	async closeTab(_, {tab}) {
		void chrome.tabs.remove(tab.id);
	},
	fetchText,
	async fetchJson(url) {
		const response = await fetch(url);
		return response.json();
	},
	async openOptionsPage(hash) {
		return safeCreateTab({
			url: chrome.runtime.getURL(`assets/options.html${hash && `#${hash}`}`),
		});
	},
	async getStyleHotfixes() {
		return styleHotfixes.get(version);
	},
});









function parseConversationUrl(value) {
	try {
		const url = new URL(value);
		const match = /^\/(?<owner>[^/]+)\/(?<repository>[^/]+)\/(?:issues|pull)\/(?<number>\d+)/.exec(url.pathname);
		if (!match?.groups) {
			return;
		}

		const {owner, repository, number} = match.groups;
		return {owner, repository, number: Number(number)};
	} catch {
		return undefined;
	}
}

async function updateConversation(
	url,
	action,
	label,
	token,
) {
	const parsed = parseConversationUrl(url);
	if (!parsed) {
		throw new Error(`Unsupported issue URL: ${url}`);
	}

	const endpoint = `https://api.github.com/repos/${parsed.owner}/${parsed.repository}/issues/${parsed.number}`;
	const headers = {
		'accept': 'application/vnd.github+json',
		'authorization': `Bearer ${token}`,
		'content-type': 'application/json',
		'x-github-api-version': '2022-11-28',
	};
	let body;
	if (action === 'close') {
		body = {state: 'closed'};
	} else {
		if (!label?.trim()) {
			throw new Error('Enter a label before applying it.');
		}

		const currentResponse = await fetch(endpoint, {headers});
		if (!currentResponse.ok) {
			throw new Error(`Could not read ${parsed.owner}/${parsed.repository}#${parsed.number}.`);
		}

		const current = await currentResponse.json() ;
		const labels = (current.labels ?? []).map(item => typeof item === 'string' ? item : item.name).filter(Boolean) ;
		body = {labels: [...new Set([...labels, label.trim()])]};
	}

	const response = await fetch(endpoint, {method: 'PATCH', headers, body: JSON.stringify(body)});
	if (!response.ok) {
		throw new Error(`Update failed for ${parsed.owner}/${parsed.repository}#${parsed.number}.`);
	}
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (sender.id !== chrome.runtime.id || !message.type?.startsWith('ztg:')) {
		return;
	}

	void (async () => {
		if (message.type === 'ztg:verify-license') {
			const entitlement = await verifyLicense(message.key ?? '');
			await chrome.alarms.create(LICENSE_ALARM, {periodInMinutes: 12 * 60});
			return {ok: true, entitlement};
		}

		if (message.type === 'ztg:bulk-update') {
			const {personalToken} = await optionsStorage.getAll();
			if (!personalToken) {
				throw new Error('Add a personal token in Settings before changing issues.');
			}

			const urls = [...new Set(message.urls)];
			const results = await Promise.allSettled(urls.map(async url => updateConversation(url, message.action, message.label, personalToken)));
			const failed = results.filter(result => result.status === 'rejected');
			return {ok: failed.length === 0, updated: results.length - failed.length, failed: failed.length};
		}

		throw new Error('Unknown cockpit request.');
	})().then(result => {
		sendResponse(result);
	}).catch((error) => {
		sendResponse({ok: false, error: error instanceof Error ? error.message : String(error)});
	});
	return true;
});

chrome.alarms.onAlarm.addListener(async alarm => {
	if (alarm.name !== LICENSE_ALARM) {
		return;
	}

	const stored = await chrome.storage.local.get(ENTITLEMENT_KEY);
	const key = (stored[ENTITLEMENT_KEY] )?.key;
	if (!key) {
		return;
	}

	try {
		await verifyLicense(key);
	} catch {
		await chrome.storage.local.remove(ENTITLEMENT_KEY);
	}
});

chrome.action.onClicked.addListener(async tab => {
	if (doesBrowserActionOpenOptions) {
		void chrome.runtime.openOptionsPage();
		return;
	}

	const {actionUrl} = await optionsStorage.getAll();
	if (!actionUrl) {
		// Default to options page if unset
		void chrome.runtime.openOptionsPage();
		return;
	}

	await safeCreateTab({
		openerTabId: tab.id,
		url: actionUrl,
	});
});

async function showWelcomePage() {
	if (await welcomeShown.get()) {
		return;
	}

	const [hasStoredToken, hasPermissions] = await Promise.all([
		hasToken(), // We can't handle an invalid token on a "Welcome" page, so just check whether the user has ever set one
		chrome.permissions.contains({origins: ['https://github.com/*']}),
	]);

	try {
		if (hasStoredToken && hasPermissions) {
			// Mark as welcomed
			return;
		}

		const url = chrome.runtime.getURL('assets/welcome.html');
		await safeCreateTab({url});
	} finally {
		// Make sure it's always set to true even in case of errors
		await welcomeShown.set(true);
	}
}

chrome.runtime.onInstalled.addListener(async () => {
	if (isDevelopmentVersion()) {
		await globalCache.clear();
	}

	// Call after the reset above just in case we nuked Safari's base permissions
	await showWelcomePage();
});
