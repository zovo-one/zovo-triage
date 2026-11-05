import { isPR } from '../npm/ztg-github-url-detection.js';
import { $ } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import { onConversationTitleFieldKeydown } from '../github-events/ztg-on-field-keydown.js';
import { assertNodeContent } from '../helpers/ztg-dom-utils.js';

function handleEscPress(event) {
	if (event.key !== 'Escape') {
		return;
	}

	if (!(event.delegateTarget instanceof HTMLInputElement)) {
		return;
	}

	const cancelButton = $([
		'div[class^="prc-PageLayout-HeaderContent"] > form button[data-variant="invisible"]',
		// TODO [2027-01-01]: Remove after legacy PR files view is removed
		'.js-cancel-issue-edit',
	]);
	assertNodeContent(cancelButton, 'Cancel');

	cancelButton.click();
	event.stopImmediatePropagation();
	event.preventDefault();
}

function init(signal) {
	onConversationTitleFieldKeydown(handleEscPress, signal);
}

void features.add(import.meta.url, {
	shortcuts: {
		esc: 'Cancel editing a conversation title',
	},
	include: [
		isPR,
	],
	init,
});

/*

Test URLs:

1. Visit https://github.com/pulls
2. Open any PR
3. Try to edit the title
4. Press Esc

*/
