import delegate from '../npm/ztg-delegate-it-delegate.js';
import React from '../npm/ztg-dom-chef.js';
import { isPRConversation, isPRFiles } from '../npm/ztg-github-url-detection.js';
import TrashIcon from '../npm/ztg-octicons-plain-react-components-Trash.js';
import { closestElement, $ } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import loadDetailsMenu from '../github-helpers/ztg-load-details-menu.js';
import showToast from '../github-helpers/ztg-toast.js';
import observe from '../helpers/ztg-selector-observer.js';

function onButtonClick({delegateTarget: button}) {
	try {
		closestElement('.js-comment', button)
			.querySelector(':scope .show-more-popover .js-comment-delete > button')
			.click();
	} catch (error) {
		void showToast(new Error('Feature broken. Please open an issue with the link found in the console'));
		throw error;
	}
}

async function preloadDropdown({delegateTarget: button}) {
	const comment = closestElement('.js-comment', button);
	await loadDetailsMenu($('details-menu.show-more-popover', comment));
}

function addDeleteButton(cancelButton) {
	cancelButton.before(
		React.createElement('button', { className: "btn btn-danger float-left mr-auto rgh-review-comment-delete-button"    , type: "button",}
, React.createElement(TrashIcon, null )
),
	);
}

function init(signal) {
	delegate('.rgh-review-comment-delete-button', 'click', onButtonClick, {signal});
	delegate('.rgh-quick-comment-edit-button', 'click', preloadDropdown, {signal});
	observe('.review-comment .js-comment-cancel-button', addDeleteButton, {signal});
}

void features.add(import.meta.url, {
	include: [
		isPRConversation,
		isPRFiles,
	],
	init,
});

/*

Test URLs

- https://github.com/refined-github/sandbox/pull/31
- https://github.com/refined-github/sandbox/pull/31/files

*/
