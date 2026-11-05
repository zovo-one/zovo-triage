import React from '../npm/ztg-dom-chef.js';
import { closestElementOptional, closestElement, $, $$ } from '../npm/ztg-select-dom.js';
import delegate from '../npm/ztg-delegate-it-delegate.js';
import { hasComments } from '../npm/ztg-github-url-detection.js';
import features from '../ztg-feature-manager.js';

const formSelector = [
	'form[action$="/minimize-comment"]',
	'form[action$="/minimize"]', // Review thread comments
] ;

function generateSubmenu(hideButton) {
	if (closestElementOptional('.rgh-quick-comment-hiding-details', hideButton)) {
		// Already generated
		return;
	}

	const detailsElement = closestElement('details', hideButton);
	detailsElement.classList.add('rgh-quick-comment-hiding-details');

	const comment = closestElement('.unminimized-comment', hideButton);
	const hideCommentForm = $(formSelector, comment);

	// Generate dropdown
	const newForm = hideCommentForm.cloneNode();
	const fields = [...hideCommentForm.elements].map(field => field.cloneNode());
	newForm.append(React.createElement('i', { hidden: true,}, fields)); // Add existing fields (comment ID, token)
	newForm.setAttribute('novalidate', 'true'); // Ignore the form's required attributes

	// Imitate existing menu, reset classes
	newForm.className = '';
	newForm.classList.add(
		'js-comment-minimize',
		'dropdown-menu',
		'dropdown-menu-sw',
		'color-fg-default',
		'show-more-popover',
		'anim-scale-in',
	);

	for (const reason of $$('option:not([value=""])', hideCommentForm.elements.classifier)) {
		newForm.append(
			React.createElement('button', {
				type: "submit",
				name: "classifier",
				value: reason.value,
				className: "dropdown-item btn-link" ,
				role: "menuitem",}

, reason.textContent
),
		);
	}

	// Close immediately after the clicking option
	newForm.addEventListener('click', () => {
		detailsElement.open = false;
	});

	detailsElement.append(newForm);
}

// Shows menu on top of mainDropdownContent when "Hide" is clicked;
// Hide it when dropdown closes.
// Uses `v-hidden` to avoid conflicts with `close-out-of-view-modals`
function toggleSubmenu(hideButton, show) {
	const dropdown = closestElement('details', hideButton);

	// Native dropdown
	$('details-menu', dropdown).classList.toggle('v-hidden', show);

	// "Hide comment" dropdown
	$(formSelector, dropdown).classList.toggle('v-hidden', !show);
}

function resetDropdowns(event) {
	toggleSubmenu(event.delegateTarget, false);
}

function showSubmenu(event) {
	generateSubmenu(event.delegateTarget);
	toggleSubmenu(event.delegateTarget, true);

	event.stopImmediatePropagation();
	event.preventDefault();
}

function init(signal) {
	// `capture: true` required to be fired before GitHub's handlers
	delegate('.js-comment-hide-button', 'click', showSubmenu, {capture: true, signal});
	delegate('.rgh-quick-comment-hiding-details', 'toggle', resetDropdowns, {capture: true, signal});
}

// TODO [2027-01-01]: Drop feature after the legacy PR view is removed
// https://github.com/refined-github/refined-github/issues/7856#issuecomment-2411492400
void features.add(import.meta.url, {
	include: [
		hasComments,
	],
	init,
});

/*

Test URLs

https://github.com/refined-github/sandbox/pull/47

*/
