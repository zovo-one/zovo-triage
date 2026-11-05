import { clsx } from '../npm/ztg-clsx-clsx.js';
import delegate from '../npm/ztg-delegate-it-delegate.js';
import React from '../npm/ztg-dom-chef.js';
import { isNewFile, isCompare, isEditingFile } from '../npm/ztg-github-url-detection.js';
import { elementExists } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import { modifierKey } from '../github-helpers/ztg-hotkey.js';

function onKeyDown(event) {
	const field = event.delegateTarget;
	const form = field.form;
	if (
		event.key !== 'Enter'
		|| event.ctrlKey
		|| event.metaKey
		|| event.isComposing // #4323
		|| elementExists([
			'.suggester', // GitHub’s autocomplete dropdown
			'.rgh-avoid-accidental-submissions',
		], form)
	) {
		return;
	}

	if (
		elementExists([
			'button[data-hotkey="Mod+Enter"]:disabled',
			'button[type="submit"]:disabled',
		], form)
	) {
		return;
	}

	const spacingClasses = isNewFile() || isEditingFile()
		? 'mb-3 mt-n2'
		: 'mt-2 mb-n1';

	const message = (
		React.createElement('p', { className: clsx('rgh-avoid-accidental-submissions', spacingClasses),}, "A submission via "
   , React.createElement('kbd', null, "enter"), " has been prevented. You can press "       , React.createElement('kbd', null, "enter"), " again or use"   , ' '
, React.createElement('kbd', null, modifierKey)
, React.createElement('kbd', null, "enter"), "."
)
	);

	if (isNewFile() || isEditingFile()) {
		field.after(message);
	} else {
		field.parentElement.append(message);
	}

	event.preventDefault();
}

function init(signal) {
	delegate([
		'input[name="pull_request[title]"]', // `isCompare`
		'#commit-message-input', // `isEditingFile`, `isNewFile`
	], 'keydown', onKeyDown, {signal, capture: true});
}

void features.add(import.meta.url, {
	include: [
		isNewFile,
		isCompare,
		isEditingFile,
	],
	init,
});

/*

Test URLs:

isNewFile: https://github.com/refined-github/sandbox/new/default-a
isCompare: https://github.com/refined-github/sandbox/compare/default-a...quick-pr-branch?expand=1
isEditingFile: https://github.com/refined-github/sandbox/edit/default-a/README.md

*/
