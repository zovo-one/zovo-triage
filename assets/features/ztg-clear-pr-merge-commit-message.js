import React from '../npm/ztg-dom-chef.js';
import { isPRConversation } from '../npm/ztg-github-url-detection.js';
import { countElements, $, closestElement } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import getDefaultBranch from '../github-helpers/ztg-get-default-branch.js';
import { userHasPushAccess } from '../github-helpers/ztg-get-user-permission.js';
import { getConversationAuthor } from '../github-helpers/ztg-index.js';
import { getBranches } from '../github-helpers/ztg-pr-branches.js';
import { confirmMergeButton } from '../github-helpers/ztg-selectors.js';
import attachElement from '../helpers/ztg-attach-element.js';
import cleanCommitMessage from '../helpers/ztg-clean-commit-message.js';
import observe from '../helpers/ztg-selector-observer.js';
import { setReactTextareaValue } from '../helpers/ztg-set-react-text-field-value.js';

const isPrAgainstDefaultBranch = async () => getBranches().base.branch === await getDefaultBranch();

async function clear(messageField) {
	if (!/squash/i.test($(confirmMergeButton).textContent)) {
		return;
	}

	const originalMessage = messageField.value;
	const author = getConversationAuthor();
	let cleanedMessage = cleanCommitMessage(originalMessage, !await isPrAgainstDefaultBranch(), [author]);

	if (cleanedMessage === originalMessage.trim()) {
		return;
	}

	cleanedMessage = cleanedMessage ? cleanedMessage + '\n' : '';
	// Do not use `text-field-edit` #6348
	setReactTextareaValue(messageField, cleanedMessage);

	let isUndoing = false;
	function toggleUndoRedo({currentTarget}) {
		isUndoing = !isUndoing;
		setReactTextareaValue(messageField, isUndoing ? originalMessage : cleanedMessage);
		currentTarget.textContent = isUndoing ? 'Redo' : 'Undo';
	}

	const anchor = closestElement('div[data-has-label]', messageField);
	attachElement(anchor, {
		after: () => (
			React.createElement('div', { className: "flex-self-stretch",}
, React.createElement('p', { className: "note",}, "The description field was"
   , ' '
, React.createElement('a', {
						target: "_blank",
						href: "https://github.com/refined-github/refined-github/wiki/Extended-feature-descriptions#clear-pr-merge-commit-message",
						rel: "noreferrer",}
, "cleared"

), ' ', "by Refined GitHub. "
   , React.createElement('button', { type: "button", className: "btn-link", onClick: toggleUndoRedo,}, "Undo")
)
)
		),
	});
}

async function init(signal) {
	observe('textarea[placeholder="Add an optional extended description…"]', clear, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		isPRConversation,
		userHasPushAccess,
	],
	exclude: [
		// Don't clear 1-commit PRs #3140
		() => countElements('.TimelineItem.js-commit') === 1,
	],
	awaitDomReady: true, // Appears near the end of the page anyway
	requiresToken: true,
	init,
});

/*

Test URLs

PR against non-default branch:
https://github.com/refined-github/sandbox/pull/53

*/
