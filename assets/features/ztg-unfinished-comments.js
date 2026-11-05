import delegate from '../npm/ztg-delegate-it-delegate.js';
import { hasRichTextEditor } from '../npm/ztg-github-url-detection.js';
import { $$optional } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';

let submitting;

const prefix = '✏️ Comment - ';

function isFieldDirty(field) {
	return field.matches('[class*="Textarea"]')
		? field.value.length > 0 // React fields update both value and textContent, so default to "filled === dirty"
		: field.value !== field.textContent;
}

function hasDraftComments() {
	// `[id^="convert-to-issue-body"]` excludes the hidden pre-filled textareas created when opening the dropdown menu of review comments
	return $$optional('textarea:not([id^="convert-to-issue-body"])').some(f => isFieldDirty(f));
}

function disableOnSubmit() {
	clearTimeout(submitting);
	submitting = setTimeout(() => {
		submitting = undefined;
	}, 2000);
}

function updateDocumentTitle() {
	if (submitting) {
		return;
	}

	// Ensure it does not pile up
	document.title = document.title.replace(prefix, '');

	document.title = document.visibilityState === 'hidden' && hasDraftComments()
		? prefix + document.title
		: document.title.replace(prefix, '');
}

function init(signal) {
	delegate('form', 'submit', disableOnSubmit, {capture: true, signal});
	document.addEventListener('visibilitychange', updateDocumentTitle, {signal});
}

void features.add(import.meta.url, {
	include: [
		hasRichTextEditor,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/sandbox/pull/4
https://github.com/refined-github/sandbox/pull/4/changes
https://github.com/refined-github/sandbox/issues/3

*/
