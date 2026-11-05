import delegate from '../npm/ztg-delegate-it-delegate.js';
import React from '../npm/ztg-dom-chef.js';
import { isMergedPR, isPRConversation } from '../npm/ztg-github-url-detection.js';
import { $, $optional } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import onCommitTitleUpdate from '../github-events/ztg-on-commit-title-update.js';
import api from '../github-helpers/ztg-api.js';
import { userCanLikelyMergePr, getConversationNumber } from '../github-helpers/ztg-index.js';
import parseRenderedText from '../github-helpers/ztg-parse-rendered-text.js';
import { confirmMergeButton } from '../github-helpers/ztg-selectors.js';
import cleanPrCommitTitle from '../helpers/ztg-pr-commit-cleaner.js';
import observe from '../helpers/ztg-selector-observer.js';
import { setReactInputValue } from '../helpers/ztg-set-react-text-field-value.js';

const commitTitleFieldSelector = '[data-testid="mergebox-partial"] input[type="text"]';

function getCurrentCommitTitle() {
	return $(commitTitleFieldSelector).value.trim();
}

function formatPrCommitTitle(title, prNumber = getConversationNumber()) {
	return `${title} (#${prNumber})`;
}

function createCommitTitle() {
	const prTitle = $([
		'h1[class^="prc-PageHeader-Title"] .markdown-title',
		'div[class^="prc-PageLayout-Header"] input',
	]);
	const prTitleText = prTitle instanceof HTMLInputElement ? prTitle.value.trim() : parseRenderedText(prTitle);
	return formatPrCommitTitle(prTitleText);
}

function needsSubmission() {
	// `needsSubmission` is also called when the PR title is changed, in order to update the open merge box in real time
	if (!/squash/i.test($optional(confirmMergeButton)?.textContent ?? '')) {
		return false;
	}

	const currentCommitTitle = getCurrentCommitTitle();
	return Boolean(currentCommitTitle) && (createCommitTitle() !== currentCommitTitle);
}

function getUi() {
	const cancelButton = React.createElement('button', { type: "button", className: "btn-link Link--muted text-underline rgh-sync-pr-commit-title"   ,}, "Cancel"

);
	return $optional('.rgh-sync-pr-commit-title-note') ?? (
		React.createElement('p', { className: "note rgh-sync-pr-commit-title-note" ,}, "The title of this PR will be updated to match this title. "
            , cancelButton
)
	);
}

function updateUi() {
	if (needsSubmission()) {
		$(commitTitleFieldSelector).parentElement.after(getUi());
	} else {
		getUi().remove();
	}
}

async function updatePrTitle() {
	if (!needsSubmission()) {
		return;
	}

	// Remove PR number from commit title
	const title = cleanPrCommitTitle(getCurrentCommitTitle(), getConversationNumber());

	await api.v3(`pulls/${getConversationNumber()}`, {
		method: 'PATCH',
		body: {title},
	});
}

async function updateCommitTitle() {
	if (!needsSubmission()) {
		return;
	}

	const field = $(commitTitleFieldSelector);
	setReactInputValue(field, createCommitTitle());
}

function disableSubmission() {
	features.unload(import.meta.url);
	getUi().remove();
}

function init(signal) {
	// PR title -> Commit title field
	// On panel open
	observe(commitTitleFieldSelector, updateCommitTitle, {signal});

	// On PR title change
	observe(
		'h1[class^="prc-PageHeader-Title"]',
		updateCommitTitle,
		{signal},
	);

	// Commit title field -> toggle checkbox visibility
	onCommitTitleUpdate(updateUi, signal);

	// On submission, update PR
	delegate(confirmMergeButton, 'click', updatePrTitle, {signal});

	// On "Cancel", disable the feature
	delegate('.rgh-sync-pr-commit-title', 'click', disableSubmission, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		userCanLikelyMergePr,
	],
	include: [
		isPRConversation,
	],
	exclude: [
		isMergedPR,
	],
	awaitDomReady: true, // DOM-based filters, feature appears at the end of the page
	init,
});

/*

Test URLs:

1. Open any PR in https://github.com/pulls

*/

export { formatPrCommitTitle };
