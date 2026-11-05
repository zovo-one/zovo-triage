import './ztg-options.svelte.js';
import './npm/ztg-webext-bugs-target-blank.js';
import { enableTabToIndent } from './npm/ztg-indent-textarea.js';
import { $$, $ } from './npm/ztg-select-dom.js';
import elementReady from './npm/ztg-element-ready.js';
import clearCacheHandler from './helpers/ztg-clear-cache-handler.js';
import { perDomainOptions } from './ztg-options-storage.js';
import initToggleAllButtons from './options/ztg-toggle-all.js';
import { assertDefined } from './npm/ztg-ts-extras-assert-defined.js';

function sortFeatures() {
	const container = $('.js-features');
	const features = $$('.feature-item').toSorted((a, b) => a.dataset.text.localeCompare(b.dataset.text));
	const grouped = Object.groupBy(features, feature => {
		const checkbox = $('input.feature-checkbox', feature);
		return checkbox.checked ? 'on' : checkbox.disabled ? 'broken' : 'off';
	});

	for (const group of [grouped.off, grouped.broken, grouped.on]) {
		if (group) {
			for (const feature of group) {
				container.append(feature);
			}
		}
	}
}

function updateListDom() {
	sortFeatures();

	// Notify <feature-count> that the DOM state has updated
	globalThis.dispatchEvent(new CustomEvent('rgh:update-count'));
}

function informComponentOfExternalUpdate(field) {
	field.dispatchEvent(new InputEvent('input', {bubbles: true}));
}

assertDefined(
	await elementReady('.js-features', {
		stopOnDomReady: false,
		signal: AbortSignal.timeout(1000),
	}),
);

// Update list from saved options
const syncedForm = await perDomainOptions.syncForm('form');

// <token-input> runs before the value is set, so it detects `firstRun` to avoid validation on an empty form.
// This triggers a proper run
for (const tokenField of $$('input[name="personalToken"]')) {
	informComponentOfExternalUpdate(tokenField);
}

// Decorate list
updateListDom();
initToggleAllButtons();

// JS loaded, remove message before it appears
$('#js-failed').remove();

// Update domain-dependent page content when the domain is changed
syncedForm.onChange(async domain => {
	const host = domain === 'default' ? 'github.com' : domain;

	// Point the link to the right domain
	$('a#personal-token-link').host = host;

	$('rgh-options').domain = domain;

	for (const input of $$('input[name="personalToken"]')) {
		informComponentOfExternalUpdate(input);
	}

	updateListDom();
});

// Refresh page when permissions are changed (because the dropdown selector needs to be regenerated)
chrome.permissions.onRemoved.addListener(() => {
	location.reload();
});
chrome.permissions.onAdded.addListener(() => {
	location.reload();
});

// Improve textareas editing
enableTabToIndent('textarea');

// Add cache clearer
$('#clear-cache').addEventListener('click', clearCacheHandler);
