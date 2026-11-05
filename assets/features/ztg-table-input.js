import delegate from '../npm/ztg-delegate-it-delegate.js';
import React from '../npm/ztg-dom-chef.js';
import { hasRichTextEditor } from '../npm/ztg-github-url-detection.js';
import TableIcon from '../npm/ztg-octicons-plain-react-components-Table.js';
import { closestElement, closestElementOptional, $ } from '../npm/ztg-select-dom.js';
import { insertTextIntoField } from '../npm/ztg-text-field-edit.js';
import features from '../ztg-feature-manager.js';
import { actionBar } from '../github-helpers/ztg-selectors.js';
import observe from '../helpers/ztg-selector-observer.js';
import smartBlockWrap from '../helpers/ztg-smart-block-wrap.js';
import { withTooltipRef } from '../components/ztg-tooltip.js';

function addTable({delegateTarget: square}) {
	// In the PR's "Files changed" tab, the table input is in a `<details>` menu;
	// when clicking a square, the menu closes and steals the focus from the textarea,
	// so close it ourselves first to keep the focus on the field
	closestElement('details', square).open = false;

	const container = closestElementOptional('fieldset', square) // Issue
		?? square.form.querySelector('.CommentBox-container'); // PR
	const field = $('textarea', container);
	const cursorPosition = field.selectionStart;

	const columns = Number(square.dataset.x);
	const rows = Number(square.dataset.y);
	const row = columns === 1
		// One HTML line per row
		? '<tr><td>\n'
		// <tr> on its own line
		// "1 space" indents without causing unwanted Markdown code blocks that 4 spaces would cause
		: '<tr>\n' + ' <td>\n'.repeat(columns);
	field.focus();
	const table = '<table>\n' + row.repeat(rows) + '</table>';
	insertTextIntoField(field, smartBlockWrap(table, field));

	// Move caret to first cell
	field.selectionEnd = field.value.indexOf('<td>', cursorPosition) + '<td>'.length;
}

function add(container) {
	container.classList.add('d-flex');

	container.parentElement.append(
		React.createElement('details', { className: "details-reset details-overlay select-menu select-menu-modal-right hx_rsm my-auto"     ,}
, React.createElement('summary', {
				ref: withTooltipRef('Add a table'),
				className: "Button Button--iconOnly Button--invisible Button--medium"   ,
				role: "button",
				'aria-haspopup': "menu",}

, React.createElement(TableIcon, null )
)
, React.createElement('details-menu', {
				className: "select-menu-modal position-absolute right-0 hx_rsm-modal rgh-table-input"    ,
				role: "menu",}

, Array.from({length: 25}, (_, index) => (
					React.createElement('button', {
						type: "button",
						role: "menuitem",
						className: "rgh-tic btn-link" ,
						'data-x': (index % 5) + 1,
						'data-y': Math.floor(index / 5) + 1,}
					)
				))
)
),
	);
}

function init(signal) {
	observe(actionBar, add, {signal});
	delegate('.rgh-tic', 'click', addTable, {signal, capture: true});
}

void features.add(import.meta.url, {
	include: [
		hasRichTextEditor,
	],
	init,
});

/*

Test URLs:

- Any issue or PR

*/
