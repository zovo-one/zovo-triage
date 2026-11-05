import delegate from '../npm/ztg-delegate-it-delegate.js';
import React from '../npm/ztg-dom-chef.js';
import { isArchivedRepo, isConversation } from '../npm/ztg-github-url-detection.js';
import XIcon from '../npm/ztg-octicons-plain-react-components-X.js';
import { elementExists, closestElement, $ } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import api from '../github-helpers/ztg-api.js';
import { getConversationNumber } from '../github-helpers/ztg-index.js';
import showToast from '../github-helpers/ztg-toast.js';
import observe from '../helpers/ztg-selector-observer.js';
import { assertError } from '../npm/ztg-ts-extras-assert-error.js';

// Don't cache: https://github.com/refined-github/refined-github/issues/7283
function canEditLabels() {
	return elementExists('.label-select-menu .octicon-gear');
}

function getLabelList() {
	return $('.label-select-menu [src] .hx_rsm-content');
}

function restoreLabelList() {
	const list = getLabelList();
	list.replaceChildren(
		React.createElement('include-fragment', { src: closestElement('[src]', list).getAttribute('src'),} ),
	);
}

function removeLabelList() {
	const list = getLabelList();
	closestElement('details', list).addEventListener('toggle', restoreLabelList, {once: true});
	list.replaceChildren();
}

async function removeLabelButtonClickHandler(event) {
	event.preventDefault();

	const labelRemovalButton = event.delegateTarget;
	const label = closestElement('a', labelRemovalButton);

	try {
		label.hidden = true;
		// Disable dropdown list to avoid race conditions in the UI.
		// Each deletion would be followed by a reload of the list _at the wrong time_
		removeLabelList();

		await api.v3(`issues/${getConversationNumber()}/labels/${labelRemovalButton.dataset.name}`, {
			method: 'DELETE',
		});
	} catch (error) {
		assertError(error);
		void showToast(error);
		labelRemovalButton.blur();
		label.hidden = false;
		return;
	}

	label.remove();
}

function addRemoveLabelButton(label) {
	label.classList.add('d-inline-flex');
	label.append(
		React.createElement('button', {
			type: "button",
			className: "btn-link rgh-quick-label-removal" ,
			'data-name': label.dataset.name,}

, React.createElement(XIcon, null )
),
	);
}

async function init(signal) {
	delegate('.rgh-quick-label-removal:enabled', 'click', removeLabelButtonClickHandler, {signal});
	observe('.js-issue-labels .IssueLabel', addRemoveLabelButton, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		isConversation,
		canEditLabels,
	],
	exclude: [
		isArchivedRepo,
	],
	awaitDomReady: true, // The sidebar is near the end of the page
	requiresToken: true,
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github/pull/3454
https://github.com/refined-github/refined-github/issues/3440

*/
