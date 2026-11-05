const SNOOZE_KEY = 'ztg.v2.snoozed';
const SEARCH_KEY = 'ztg.v2.saved-searches';
const ENTITLEMENT_KEY = 'ztg.v2.entitlement';
const LICENSE_PATTERN = /^ZOVO-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}$/;

let queueItems = [];
let notificationTabId;
let entitled = false;

const $ = selector => document.querySelector(selector);

function setSyncState(text, error = false) {
	const state = $('#ztg-sync-state');
	state.textContent = text;
	state.dataset.error = String(error);
}

function filteredItems() {
	const repository = $('#ztg-repository-filter').value;
	const reason = $('#ztg-reason-filter').value;
	return queueItems.filter(item => (!repository || item.repository === repository) && (!reason || item.reason === reason));
}

function option(value, label = value) {
	const element = document.createElement('option');
	element.value = value;
	element.textContent = label;
	return element;
}

function populateFilters() {
	const repository = $('#ztg-repository-filter');
	const reason = $('#ztg-reason-filter');
	const currentRepository = repository.value;
	const currentReason = reason.value;
	repository.replaceChildren(option('', 'All repositories'));
	reason.replaceChildren(option('', 'All reasons'));
	for (const value of [...new Set(queueItems.map(item => item.repository))].toSorted((a, b) => a.localeCompare(b))) repository.append(option(value));
	for (const value of [...new Set(queueItems.map(item => item.reason))].toSorted((a, b) => a.localeCompare(b))) reason.append(option(value));
	repository.value = currentRepository;
	reason.value = currentReason;
}

async function markDone(item) {
	const response = await chrome.tabs.sendMessage(notificationTabId, {type: 'ztg:mark-done', href: item.href});
	if (!response?.ok) {
		setSyncState('Could not find the page action. Refresh the inbox tab.', true);
		return;
	}

	queueItems = queueItems.filter(candidate => candidate.href !== item.href);
	renderQueue();
	setSyncState('Marked done.');
}

async function snooze(item, select) {
	const duration = Number(select.value);
	const response = await chrome.tabs.sendMessage(notificationTabId, {type: 'ztg:snooze-notification', href: item.href, until: Date.now() + duration});
	if (!response?.ok) {
		setSyncState('Snooze failed. Refresh the inbox tab.', true);
		return;
	}

	queueItems = queueItems.filter(candidate => candidate.href !== item.href);
	renderQueue();
	setSyncState('Snoozed.');
}

function renderQueue() {
	const list = $('#ztg-inbox-list');
	const items = filteredItems();
	list.replaceChildren();
	for (const item of items) {
		const card = document.createElement('article');
		card.className = 'ztg-notice';
		const link = document.createElement('a');
		link.href = item.href;
		link.target = '_blank';
		link.rel = 'noreferrer';
		link.textContent = item.title;
		const meta = document.createElement('div');
		meta.className = 'ztg-notice-meta';
		meta.append(Object.assign(document.createElement('span'), {textContent: item.repository}), Object.assign(document.createElement('span'), {textContent: item.reason}));
		const actions = document.createElement('div');
		actions.className = 'ztg-notice-actions';
		const done = Object.assign(document.createElement('button'), {type: 'button', textContent: 'Done'});
		done.addEventListener('click', () => void markDone(item));
		const select = document.createElement('select');
		select.setAttribute('aria-label', `Snooze ${item.title}`);
		select.append(option(String(60 * 60 * 1000), '1 hour'), option(String(24 * 60 * 60 * 1000), '1 day'), option(String(7 * 24 * 60 * 60 * 1000), '1 week'));
		if (entitled) select.append(option(String(30 * 24 * 60 * 60 * 1000), '30 days'));
		const snoozeButton = Object.assign(document.createElement('button'), {type: 'button', textContent: 'Snooze'});
		snoozeButton.addEventListener('click', () => void snooze(item, select));
		actions.append(done, select, snoozeButton);
		card.append(link, meta, actions);
		list.append(card);
	}

	$('#ztg-empty').hidden = items.length > 0;
	$('#ztg-queue-count').textContent = String(queueItems.length);
	$('#ztg-visible-count').textContent = `${items.length} shown`;
}

async function connectInbox() {
	setSyncState('Looking for your notifications tab…');
	const tabs = await chrome.tabs.query({url: 'https://github.com/notifications*'});
	const tab = tabs.find(candidate => candidate.id);
	if (!tab?.id) {
		notificationTabId = undefined;
		queueItems = [];
		populateFilters();
		renderQueue();
		setSyncState('Open the notifications page to connect.', true);
		return;
	}

	notificationTabId = tab.id;
	try {
		const response = await chrome.tabs.sendMessage(tab.id, {type: 'ztg:read-notifications'});
		if (!response?.ok) throw new Error('No inbox response');
		const stored = await chrome.storage.local.get(SNOOZE_KEY);
		const snoozed = stored[SNOOZE_KEY] ?? {};
		queueItems = response.items.filter(item => !(snoozed[item.href] > Date.now()));
		populateFilters();
		renderQueue();
		setSyncState(queueItems.length > 0 ? 'Inbox connected. Work from the top.' : 'Inbox connected — nothing needs attention.');
	} catch {
		queueItems = [];
		populateFilters();
		renderQueue();
		setSyncState('Reload the notifications tab once, then refresh.', true);
	}
}

async function openInbox() {
	if (notificationTabId) {
		await chrome.tabs.update(notificationTabId, {active: true});
	} else {
		await chrome.tabs.create({url: 'https://github.com/notifications'});
	}
}

async function renderSavedSearches() {
	const stored = await chrome.storage.local.get(SEARCH_KEY);
	const searches = stored[SEARCH_KEY] ?? [];
	const container = $('#ztg-pinned-searches');
	container.replaceChildren();
	if (searches.length === 0) {
		container.append(Object.assign(document.createElement('span'), {className: 'ztg-muted', textContent: 'Pin filters from an issue list.'}));
		return;
	}

	for (const [index, search] of searches.entries()) {
		const link = document.createElement('a');
		link.href = search.url;
		link.target = '_blank';
		link.rel = 'noreferrer';
		link.textContent = `${index + 1} · ${search.label}`;
		container.append(link);
	}
}

async function readEntitlement() {
	const stored = await chrome.storage.local.get(ENTITLEMENT_KEY);
	const value = stored[ENTITLEMENT_KEY];
	entitled = value?.valid === true;
	const badge = $('#ztg-plan-badge');
	badge.textContent = entitled ? 'SUPPORTER' : 'FREE';
	badge.dataset.entitled = String(entitled);
}

async function activateLicense(event) {
	event.preventDefault();
	const input = $('#ztg-license-key');
	const status = $('#ztg-license-status');
	const key = input.value.trim().toUpperCase();
	if (!LICENSE_PATTERN.test(key)) {
		status.textContent = 'Use four groups of four letters or numbers.';
		return;
	}

	status.textContent = 'Verifying…';
	const response = await chrome.runtime.sendMessage({type: 'ztg:verify-license', key});
	if (!response?.ok) {
		status.textContent = response?.error ?? 'Licence could not be verified.';
		return;
	}

	status.textContent = 'Supporter access active. 30-day snooze unlocked.';
	await readEntitlement();
	renderQueue();
}

document.addEventListener('DOMContentLoaded', () => {
	$('#ztg-settings').addEventListener('click', () => void chrome.runtime.openOptionsPage());
	$('#ztg-open-inbox').addEventListener('click', () => void openInbox());
	$('#ztg-refresh').addEventListener('click', () => void connectInbox());
	$('#ztg-repository-filter').addEventListener('change', renderQueue);
	$('#ztg-reason-filter').addEventListener('change', renderQueue);
	$('#ztg-license-form').addEventListener('submit', event => void activateLicense(event));
	void Promise.all([readEntitlement(), renderSavedSearches()]).then(connectInbox);
});
