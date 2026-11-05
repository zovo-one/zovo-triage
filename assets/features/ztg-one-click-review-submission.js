import { clsx } from '../npm/ztg-clsx-clsx.js';
import delegate from '../npm/ztg-delegate-it-delegate.js';
import React from '../npm/ztg-dom-chef.js';
import { isPRFiles } from '../npm/ztg-github-url-detection.js';
import CheckIcon from '../npm/ztg-octicons-plain-react-components-Check.js';
import FileDiffIcon from '../npm/ztg-octicons-plain-react-components-FileDiff.js';
import { closestElementOptional, $optional, $, closestElement } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import { assertNodeContent } from '../helpers/ztg-dom-utils.js';
import observe from '../helpers/ztg-selector-observer.js';

// Note: This feature only works on the legacy PR Files view.
// We will drop the feature once that view has been gone for 6 months.
// https://github.com/refined-github/refined-github/issues/8711
// https://github.com/refined-github/refined-github/issues/9447

function replaceCheckboxes(originalSubmitButton) {
	const form = originalSubmitButton.form;
	const actionsRow = closestElementOptional('.Overlay-footer', originalSubmitButton);
	const formAttribute = originalSubmitButton.getAttribute('form');

	// Do not use `$$` because elements can be outside `form`
	// `RadioNodeList` is dynamic, so we need to make a copy
	const radios = [...form.elements.namedItem('pull_request_review[event]') ] ;
	if (radios.length === 0) {
		throw new Error('Could not find radio buttons');
	}

	// Set the default action for cmd+enter to Comment
	if (radios.length > 1) {
		form.prepend(
			React.createElement('input', {
				type: "hidden",
				name: "pull_request_review[event]",
				value: "comment",}
			),
		);
	}

	if (actionsRow) {
		actionsRow.prepend(React.createElement('span', { className: "spacer.gif ml-auto" ,} ));
		radios.reverse();
	}

	// Generate the new buttons
	for (const radio of radios) {
		const parent = radio.parentElement;
		const labelElement = $optional('label', parent)
			?? radio.nextSibling;
		const tooltip = $([
			'p',
			'.FormControl-caption',
		], parent).textContent.trim().replace(/\.$/, '');
		assertNodeContent(labelElement, /^(?:Approve|Request changes|Comment)$/);

		const classes = ['btn btn-sm'];

		if (tooltip) {
			classes.push('tooltipped tooltipped-nw tooltipped-no-delay');
		}

		const button = (
			React.createElement('button', {
				type: "submit",
				name: "pull_request_review[event]",
				// Old version of GH don't nest the submit button inside the form, so must be linked manually. Issue #6963.
				form: formAttribute,
				value: radio.value,
				className: clsx(classes),
				'aria-label': tooltip,
				disabled: radio.disabled,}

, labelElement.textContent
)
		);

		if (!radio.disabled && radio.value === 'approve') {
			button.prepend(React.createElement(CheckIcon, { className: "color-fg-success",} ));
		} else if (!radio.disabled && radio.value === 'reject') {
			button.prepend(React.createElement(FileDiffIcon, { className: "color-fg-danger",} ));
		}

		if (actionsRow) {
			actionsRow.prepend(button);
		} else {
			closestElement('.form-actions', originalSubmitButton).append(button);
		}
	}

	// Remove original fields at last to avoid leaving a broken form
	const fieldset = closestElementOptional('fieldset', radios[0]);

	if (fieldset) {
		fieldset.remove();
	} else {
		// To retain backwards compatibility with older GHE versions, remove any radios not within a fieldset. Issue #6963.
		for (const radio of radios) {
			closestElement('.form-checkbox', radio).remove();
		}
	}

	originalSubmitButton.remove();
}

let lastSubmission;
function blockDuplicateSubmissions(event) {
	if (lastSubmission && Date.now() - lastSubmission < 1000) {
		event.preventDefault();
		console.log('Duplicate submission prevented');
		return;
	}

	lastSubmission = Date.now();
}

function init(signal) {
	// The selector excludes the "Cancel" button
	observe('#review-changes-modal [type="submit"]:not([name])', replaceCheckboxes, {signal});
	delegate('#review-changes-modal form', 'submit', blockDuplicateSubmissions, {signal});
}

void features.add(import.meta.url, {
	include: [
		isPRFiles,
	],
	awaitDomReady: true,
	init,
});

/*

Test URLs

https://github.com/refined-github/sandbox/pull/4/files
https://github.com/refined-github/sandbox/pull/12/files

*/
