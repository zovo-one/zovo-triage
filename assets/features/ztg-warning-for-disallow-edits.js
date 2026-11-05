import React from '../npm/ztg-dom-chef.js';
import { isMergedPR, isCompare, isPRConversation } from '../npm/ztg-github-url-detection.js';
import { $optional, closestElement } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import attachElement from '../helpers/ztg-attach-element.js';

const getWarning = () => (
	React.createElement('div', { className: "flash flex-auto flash-error my-3 tmp-my-3 rgh-warning-for-disallow-edits"     ,}
, React.createElement('strong', null, "Note:"), ' ', "Maintainers may require changes. It's easier and faster to allow them to make direct changes before merging."

)
);

function init() {
	const checkbox = $optional('input[name="collab_privs"]');
	if (!checkbox) {
		return false;
	}

	if (isPRConversation()) {
		attachElement(
			closestElement('.discussion-sidebar-item', checkbox),
			{after: getWarning},
		);
	} else {
		const option = closestElement('.js-collab-option', checkbox);

		// Prevent layout shifting when warning appears
		option.classList.remove('flex-auto');
		const actionRow = option.parentElement;
		actionRow.classList.add('mt-1');
		actionRow.parentElement.classList.remove('flex-wrap');

		attachElement(
			actionRow.lastElementChild,
			{after: getWarning},
		);
	}
}

void features.add(import.meta.url, {
	include: [
		isCompare,
		isPRConversation,
	],
	exclude: [
		isMergedPR,
	],
	awaitDomReady: true,
	init,
});

/*

Test URLs:

1. Open https://github.com/pulls?q=+is%3Apr+is%3Aopen+author%3A%40me+archived%3Afalse+-user%3A%40me+
2. Open any PR opened from a fork
3. Toggle the checkbox in the sidebar

*/
