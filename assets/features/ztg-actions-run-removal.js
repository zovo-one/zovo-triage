import React from '../npm/ztg-dom-chef.js';
import { isRepositoryActions } from '../npm/ztg-github-url-detection.js';
import SquareCircleIcon from '../npm/ztg-octicons-plain-react-components-SquareCircle.js';
import TrashIcon from '../npm/ztg-octicons-plain-react-components-Trash.js';
import { closestElement, $optional, $ } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import observe from '../helpers/ztg-selector-observer.js';

function addQuickButtons(contextMenuIcon) {
	const contextMenuDetails = closestElement('details', contextMenuIcon);

	// It might be missing if the user has no access to this repo
	const menuItem = $optional([
		'form[action$="/cancel"]',
		'li:has(> button[data-show-dialog-id^="delete-workflow-run"])',
	], contextMenuDetails)?.cloneNode(true) ;

	if (!menuItem) {
		return;
	}

	const button = $('button', menuItem);
	button.ariaLabel = button.textContent.trim();
	button.replaceChildren(menuItem.tagName === 'FORM' ? React.createElement(SquareCircleIcon, null ) : React.createElement(TrashIcon, null ));
	button.classList = 'timeline-comment-action color-fg-muted btn-link rgh-actions-run-removal p-1';
	$('summary', contextMenuDetails).classList.add('p-1');
	const rightControlsContainer = contextMenuDetails.parentElement;
	// Prepending so that the cloned dialog opens instead of the one inside the menu, as it is hidden when the menu is closed
	rightControlsContainer.classList.add('d-flex', 'flex-column-reverse', 'mt-n2', 'mb-n2');
	rightControlsContainer.prepend(menuItem);
}

function init(signal) {
	observe('#partial-actions-workflow-runs .Box-row details .octicon-kebab-horizontal', addQuickButtons, {signal});
}

void features.add(import.meta.url, {
	include: [
		isRepositoryActions,
	],
	init,
});

/*

Test URLs

https://github.com/refined-github/refined-github/actions

*/
