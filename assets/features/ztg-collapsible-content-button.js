import { clsx } from '../npm/ztg-clsx-clsx.js';
import delegate from '../npm/ztg-delegate-it-delegate.js';
import React from '../npm/ztg-dom-chef.js';
import { hasRichTextEditor } from '../npm/ztg-github-url-detection.js';
import FoldDownIcon from '../npm/ztg-octicons-plain-react-components-FoldDown.js';
import { $, closestElement } from '../npm/ztg-select-dom.js';
import { insertTextIntoField } from '../npm/ztg-text-field-edit.js';
import features from '../ztg-feature-manager.js';
import { actionBar } from '../github-helpers/ztg-selectors.js';
import observe from '../helpers/ztg-selector-observer.js';
import smartBlockWrap from '../helpers/ztg-smart-block-wrap.js';

function addContentToDetails({delegateTarget}) {
	const container = closestElement([
		'form',
		'[data-testid="comment-composer"]', // Add comment form
		'[class^="MarkdownEditor-module__container"]', // Edit comment form
	], delegateTarget);

	/* There's only one rich-text editor even when multiple fields are visible; the class targets it #5303 */
	const field = $([
		'textarea.js-comment-field', // Legacy, found in some secondary forms
		'textarea[aria-labelledby="comment-composer-heading"]', // Add comment textarea
		'[class^="MarkdownInput-module__textArea"] textarea', // Edit comment textarea
	], container);
	const selection = field.value.slice(field.selectionStart, field.selectionEnd);

	// Don't indent <summary> because indentation will not be automatic on multi-line content
	const newContent = `
		<details>
		<summary>Details</summary>

		${selection}

		</details>
	`.replaceAll(/(?<=\n|\b)\t+/g, '').trim();

	field.focus();
	insertTextIntoField(field, smartBlockWrap(newContent, field));

	// Restore selection.
	// `selectionStart` will be right after the newly-inserted text
	field.setSelectionRange(
		field.value.lastIndexOf('</summary>', field.selectionStart) + '</summary>'.length + 2,
		field.value.lastIndexOf('</details>', field.selectionStart) - 2,
	);
}

function append(container) {
	const classes = [
		'Button',
		'Button--iconOnly',
		'Button--invisible',
		'Button--medium',
		'tooltipped',
		'tooltipped-sw',
		'rgh-collapsible-content-btn',

		// Old view only
		'my-auto',
		'flex-shrink-0',
	];

	// TODO: ensure it's added only once before both `table-input` and `collapsible-content-button`
	const divider = $([
		'[data-component="ActionBar.VerticalDivider"]', // React component
		'.ActionBar-divider', // Still used in gists, PRs, etc
	], container).cloneNode(true);

	Object.assign(divider.style, {
		// Sizing copied from GitHub, except the excessive 2em (see `fuchsia` docs)
		margin: 'auto var(--base-size-8, 2em)',

		// Old style only
		top: 'initial',
		bottom: 'initial',
		transform: 'initial',
	});

	container.parentElement.append(
		divider,
		React.createElement('button', {
			type: "button",
			className: clsx(classes),
			'aria-label': "Add collapsible content"  ,
			'data-targets': "action-bar.items",}

, React.createElement(FoldDownIcon, null )
),
	);
}

function init(signal) {
	observe(actionBar, append, {signal});
	delegate('.rgh-collapsible-content-btn', 'click', addContentToDetails, {signal});
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
