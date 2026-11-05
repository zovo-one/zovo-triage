import { clsx } from '../npm/ztg-clsx-clsx.js';
import React from '../npm/ztg-dom-chef.js';
import { isNotifications } from '../npm/ztg-github-url-detection.js';
import SortAscIcon from '../npm/ztg-octicons-plain-react-components-SortAsc.js';
import SortDescIcon from '../npm/ztg-octicons-plain-react-components-SortDesc.js';
import { $, $$ } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import { upperCaseFirst } from '../github-helpers/ztg-index.js';
import observe from '../helpers/ztg-selector-observer.js';

function transform(button) {
	const [buttonLabel] = button.textContent.trim().split(' ', 1);
	const clonedForm = button.form.cloneNode(true);
	$('button', clonedForm).replaceWith(
		React.createElement('button', {
			className: "Button--invisible Button--medium Button Button--invisible-noVisuals"   ,
			type: "submit",}

, React.createElement('span', { className: "Button-content",}
, React.createElement('span', { className: "Button-label", 'data-content': buttonLabel,}
, buttonLabel
)
)
),
	);

	return (
		React.createElement('li', {
			className: clsx('SegmentedControl-item', button.ariaChecked === 'true' && 'SegmentedControl-item--selected'),
			role: "listitem",
			'data-targets': "segmented-control.items",}

, clonedForm
)
	);
}

function replaceDropdown(dropdown) {
	const label = $('.Button-label .color-fg-muted', dropdown).textContent.trim();
	const buttons = $$('button.ActionListContent', dropdown);
	dropdown.classList.add('width-full', 'width-auto');
	dropdown.replaceChildren(
		React.createElement('segmented-control', null
, React.createElement('ul', {
				className: "SegmentedControl--medium SegmentedControl" ,
				role: "list",
				'aria-label': label,}

, buttons.map(button => transform(button))
)
),
	);
}

function compactDropdown(dropdown) {
	dropdown.classList.replace('width-full', 'width-auto');
	dropdown.classList.replace('ml-0', 'ml-auto');
	const label = $('.Button-content', dropdown);
	if (label.textContent.includes('Newest to')) {
		label.replaceChildren(React.createElement(SortDescIcon, null ));
	} else {
		label.classList.add('rgh-display-contents');
		label.replaceChildren(
			React.createElement('span', { className: "fgColor-severe",}, "Oldest first" ),
			React.createElement(SortAscIcon, { className: "fgColor-severe",} ),
		);
	}
}

function markForm(status) {
	const form = $(`form[data-status="${status}"]`);
	form.id ||= `rgh-mark-${status}-form`;
	const icon = $('.mr-1:has(svg)', form).cloneNode(true);
	return (
		React.createElement('button', {
			className: "d-flex justify-content-center align-items-center btn btn-sm mr-2"     ,
			form: form.id,
			type: "submit",}

, icon
/* Spaces collapsed, use mr-1 to space words */
, React.createElement('span', { className: "not-sm-sr-only sr-only mr-1"  ,}, "Mark as" )
, upperCaseFirst(status)
)
	);
}

function unwrapActions(details) {
	details.before(markForm('read'), markForm('unread'));
	details.hidden = true;
}

function init(signal) {
	observe('.notification-sort-by', compactDropdown, {signal});
	observe('.js-notifications-mark-selected-actions details.dropdown', unwrapActions, {signal});

	// Grouping is only available on the Inbox tab
	if (!new URLSearchParams(location.search).get('query')) {
		observe('.notification-group-by', replaceDropdown, {signal});
	}
}

void features.addCssFeature(import.meta.url);
void features.add(import.meta.url, {
	include: [
		isNotifications,
	],
	init,
});

/*

Test URLs:

- https://github.com/notifications

*/
