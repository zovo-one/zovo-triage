import features from '../ztg-feature-manager.js';

const SNOOZE_KEY = 'ztg.v2.snoozed';
const SEARCH_KEY = 'ztg.v2.saved-searches';





















function conversationLink(row) {
	return row.querySelector('a[href*="/issues/"], a[href*="/pull/"]');
}

function notificationRows() {
	return [...document.querySelectorAll('[data-notification-id], .notifications-list-item')];
}

function repositoryFromHref(href) {
	try {
		const parts = new URL(href, location.href).pathname.split('/').filter(Boolean);
		return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : 'Unknown repository';
	} catch {
		return 'Unknown repository';
	}
}

function readNotifications() {
	return notificationRows().flatMap(row => {
		const link = conversationLink(row) ?? row.querySelector('a[href]');
		if (!link) {
			return [];
		}

		const {href} = new URL(link.href, location.href);
		const title = link.textContent?.trim() || row.querySelector('[data-target*="title"]')?.textContent?.trim() || 'Untitled notification';
		const reason = row.querySelector('[data-reason], .Label, [title*="reason" i]')?.textContent?.trim()
			?? row.getAttribute('data-reason')
			?? 'participating';
		return [{
			id: row.dataset.notificationId ?? href,
			title,
			href,
			repository: repositoryFromHref(href),
			reason: reason.toLowerCase(),
		}];
	});
}

async function snoozeNotification(href, until) {
	const stored = await chrome.storage.local.get(SNOOZE_KEY);
	const snoozed = (stored[SNOOZE_KEY] ) ?? {};
	snoozed[href] = until;
	await chrome.storage.local.set({[SNOOZE_KEY]: snoozed});
	for (const row of notificationRows()) {
		if (conversationLink(row)?.href === href) {
			row.hidden = true;
		}
	}
}

async function applySnoozedRows() {
	const stored = await chrome.storage.local.get(SNOOZE_KEY);
	const snoozed = (stored[SNOOZE_KEY] ) ?? {};
	const now = Date.now();
	let changed = false;
	for (const [href, until] of Object.entries(snoozed)) {
		if (until <= now) {
			delete snoozed[href];
			changed = true;
		}
	}

	for (const row of notificationRows()) {
		const href = conversationLink(row)?.href;
		row.hidden = Boolean(href && snoozed[href] > now);
	}

	if (changed) {
		await chrome.storage.local.set({[SNOOZE_KEY]: snoozed});
	}
}

function markNotificationDone(href) {
	const row = notificationRows().find(candidate => conversationLink(candidate)?.href === href);
	if (!row) {
		return false;
	}

	const button = row.querySelector(
		'button[aria-label*="done" i], button[title*="done" i], button[aria-label*="read" i], form[data-status="read"] button',
	);
	if (!button) {
		return false;
	}

	button.click();
	row.remove();
	return true;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (sender.id !== chrome.runtime.id || !message.type?.startsWith('ztg:')) {
		return undefined;
	}

	if (message.type === 'ztg:read-notifications') {
		void applySnoozedRows().then(() => sendResponse({ok: true, items: readNotifications()}));
		return true;
	}

	if (message.type === 'ztg:mark-done') {
		sendResponse({ok: markNotificationDone(message.href ?? '')});
		return undefined;
	}

	if (message.type === 'ztg:snooze-notification') {
		void snoozeNotification(message.href ?? '', message.until ?? Date.now()).then(() => sendResponse({ok: true}));
		return true;
	}

	return undefined;
});

function issueRows() {
	const rows = new Set();
	for (const link of document.querySelectorAll('a[href*="/issues/"], a[href*="/pull/"]')) {
		if (!/^\/[^/]+\/[^/]+\/(?:issues|pull)\/\d+/.test(new URL(link.href, location.href).pathname)) {
			continue;
		}

		const row = link.closest('.js-issue-row, [data-testid="issue-row"], li.Box-row, div.Box-row, li[role="listitem"]');
		if (row) {
			rows.add(row);
		}
	}

	return [...rows];
}

function selectedUrls() {
	return issueRows().flatMap(row => {
		const checkbox = row.querySelector('input.ztg-row-select');
		const link = conversationLink(row);
		return link && checkbox?.checked ? [link.href] : [];
	});
}

function setQueueStatus(text, isError = false) {
	const status = document.querySelector('#ztg-queue-status');
	if (status) {
		status.textContent = text;
		status.dataset.error = String(isError);
	}
}

async function runBulkAction(action) {
	const urls = selectedUrls();
	if (urls.length === 0) {
		setQueueStatus('Select at least one row.', true);
		return;
	}

	const label = document.querySelector('#ztg-label-input')?.value.trim();
	setQueueStatus(`Updating ${urls.length}…`);
	const result = await chrome.runtime.sendMessage({type: 'ztg:bulk-update', action, label, urls}) ;
	if (!result.ok) {
		setQueueStatus(result.error ?? `${result.failed ?? 0} updates failed.`, true);
		return;
	}

	setQueueStatus(`${result.updated ?? urls.length} updated.`);
	if (action === 'close') {
		for (const row of issueRows()) {
			const link = conversationLink(row);
			if (link && urls.includes(link.href)) {
				row.remove();
			}
		}
	}
}

async function savedSearches() {
	const stored = await chrome.storage.local.get(SEARCH_KEY);
	return (stored[SEARCH_KEY] ) ?? [];
}

function currentSearchLabel() {
	const query = new URL(location.href).searchParams.get('q')?.replaceAll('+', ' ').trim();
	if (query) {
		return query.length > 28 ? `${query.slice(0, 27)}…` : query;
	}

	return location.pathname.endsWith('/pulls') ? 'Open pull requests' : 'Open issues';
}

async function pinCurrentSearch() {
	const searches = await savedSearches();
	const url = location.href;
	if (!searches.some(search => search.url === url)) {
		searches.push({id: crypto.randomUUID(), label: currentSearchLabel(), url});
		await chrome.storage.local.set({[SEARCH_KEY]: searches.slice(-5)});
	}

	await renderSavedSearches();
}

async function renderSavedSearches() {
	const container = document.querySelector('#ztg-saved-searches');
	if (!container) {
		return;
	}

	container.replaceChildren();
	const searches = await savedSearches();
	for (const [index, search] of searches.entries()) {
		const link = document.createElement('a');
		link.className = 'ztg-search-chip';
		link.href = search.url;
		link.textContent = `${index + 1} · ${search.label}`;
		link.title = `Shortcut ${index + 1}`;
		container.append(link);
	}
}

function injectQueueControls() {
	const rows = issueRows();
	if (rows.length === 0) {
		return;
	}

	for (const row of rows) {
		if (row.querySelector('.ztg-row-select')) {
			continue;
		}

		const checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		checkbox.className = 'ztg-row-select';
		checkbox.setAttribute('aria-label', `Select ${conversationLink(row)?.textContent?.trim() ?? 'conversation'}`);
		row.prepend(checkbox);
	}

	if (document.querySelector('#ztg-queuebar')) {
		return;
	}

	const toolbar = document.createElement('section');
	toolbar.id = 'ztg-queuebar';
	toolbar.className = 'ztg-queuebar';
	toolbar.setAttribute('aria-label', 'Triage queue controls');
	toolbar.innerHTML = `
		<div class="ztg-queuebar__lead"><strong>Queue cockpit</strong><span>⌨ x select · l label · c close</span></div>
		<div id="ztg-saved-searches" class="ztg-saved-searches" aria-label="Saved searches"></div>
		<div class="ztg-queuebar__actions">
			<button id="ztg-pin-search" type="button">Pin filter</button>
			<input id="ztg-label-input" aria-label="Label name" placeholder="label" />
			<button id="ztg-apply-label" type="button">Apply label</button>
			<button id="ztg-close-selected" type="button" class="ztg-danger">Close selected</button>
		</div>
		<span id="ztg-queue-status" role="status" aria-live="polite"></span>`;
	const anchor = rows[0].parentElement ?? rows[0];
	anchor.before(toolbar);
	document.querySelector('#ztg-pin-search')?.addEventListener('click', () => void pinCurrentSearch());
	document.querySelector('#ztg-apply-label')?.addEventListener('click', () => void runBulkAction('label'));
	document.querySelector('#ztg-close-selected')?.addEventListener('click', () => void runBulkAction('close'));
	void renderSavedSearches();
}

function filenameFromDiff(file) {
	return file.dataset.filePath
		?? file.querySelector('[data-path], .file-info a, .Link--primary')?.getAttribute('data-path')
		?? file.querySelector('[data-path], .file-info a, .Link--primary')?.textContent?.trim()
		?? '';
}

function isGeneratedFile(filename) {
	return /(?:^|\/)(?:package-lock\.json|npm-shrinkwrap\.json|yarn\.lock|pnpm-lock\.yaml|bun\.lockb?|composer\.lock|cargo\.lock|gemfile\.lock|poetry\.lock|pipfile\.lock)$/i.test(filename)
		|| /\.min\.(?:js|css)|\.map|\.snap|generated\.[^.]+|__generated__\//i.test(filename);
}

function collapseGeneratedFiles() {
	let collapsed = 0;
	for (const file of document.querySelectorAll('.file, [data-file-path], [data-testid="diff-file"]')) {
		if (file.dataset.ztgChecked || !isGeneratedFile(filenameFromDiff(file))) {
			continue;
		}

		file.dataset.ztgChecked = 'true';
		file.classList.add('ztg-generated-file');
		const toggle = file.querySelector('button[aria-expanded="true"], .js-details-target[aria-expanded="true"]');
		if (toggle) {
			toggle.click();
			collapsed++;
		}
	}

	return collapsed;
}

function toggleWhitespace() {
	const url = new URL(location.href);
	if (url.searchParams.get('w') === '1') {
		url.searchParams.delete('w');
	} else {
		url.searchParams.set('w', '1');
	}

	location.assign(url.href);
}

function injectDiffControls() {
	if (!/\/pull\/\d+\/(?:files|changes)|\/commit\//.test(location.pathname)) {
		return;
	}

	const count = collapseGeneratedFiles();
	let toolbar = document.querySelector('#ztg-diffbar');
	if (!toolbar) {
		toolbar = document.createElement('section');
		toolbar.id = 'ztg-diffbar';
		toolbar.className = 'ztg-diffbar';
		toolbar.innerHTML = `<strong>Diff focus</strong><span id="ztg-collapse-count"></span><button id="ztg-whitespace" type="button"></button>`;
		(document.querySelector('main') ?? document.body).prepend(toolbar);
		document.querySelector('#ztg-whitespace')?.addEventListener('click', toggleWhitespace);
	}

	const countLabel = document.querySelector('#ztg-collapse-count');
	if (countLabel && count > 0) {
		countLabel.textContent = `${count} generated file${count === 1 ? '' : 's'} collapsed`;
	}

	const whitespace = document.querySelector('#ztg-whitespace');
	if (whitespace) {
		const ignoring = new URL(location.href).searchParams.get('w') === '1';
		whitespace.textContent = ignoring ? 'Show whitespace changes' : 'Ignore whitespace';
		whitespace.setAttribute('aria-pressed', String(ignoring));
	}
}

function keyboardHandler(event) {
	if (event.metaKey || event.ctrlKey || event.altKey || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
		return;
	}

	if (/^[1-5]$/.test(event.key)) {
		const link = document.querySelectorAll('.ztg-search-chip')[Number(event.key) - 1];
		if (link) {
			event.preventDefault();
			location.assign(link.href);
		}

		return;
	}

	if (event.key.toLowerCase() === 'l') {
		event.preventDefault();
		document.querySelector('#ztg-label-input')?.focus();
	} else if (event.key.toLowerCase() === 'c') {
		event.preventDefault();
		void runBulkAction('close');
	} else if (event.key.toLowerCase() === 'x') {
		const row = document.activeElement?.closest('.js-issue-row, [data-testid="issue-row"], li.Box-row, div.Box-row, li[role="listitem"]')
			?? document.querySelector('.js-issue-row:hover, [data-testid="issue-row"]:hover, li.Box-row:hover, div.Box-row:hover, li[role="listitem"]:hover');
		const checkbox = row?.querySelector('.ztg-row-select');
		if (checkbox) {
			event.preventDefault();
			checkbox.checked = !checkbox.checked;
			setQueueStatus(checkbox.checked ? 'Row selected.' : 'Row cleared.');
		}
	}
}

function init(signal) {
	void applySnoozedRows();
	injectQueueControls();
	injectDiffControls();
	document.addEventListener('keydown', keyboardHandler, {signal});
	let timer = 0;
	const observer = new MutationObserver(() => {
		clearTimeout(timer);
		timer = window.setTimeout(() => {
			void applySnoozedRows();
			injectQueueControls();
			injectDiffControls();
		}, 120);
	});
	observer.observe(document.documentElement, {childList: true, subtree: true});
	signal.addEventListener('abort', () => {
		observer.disconnect();
		clearTimeout(timer);
		document.querySelectorAll('#ztg-queuebar, #ztg-diffbar, .ztg-row-select').forEach(element => element.remove());
	}, {once: true});
}

void features.add(import.meta.url, {awaitDomReady: true, init});
