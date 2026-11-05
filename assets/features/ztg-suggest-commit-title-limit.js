import delegate from '../npm/ztg-delegate-it-delegate.js';
import { isMergedPR, isEditingFile, isCompare, isPR } from '../npm/ztg-github-url-detection.js';
import features from '../ztg-feature-manager.js';
import onCommitTitleUpdate from '../github-events/ztg-on-commit-title-update.js';
import waitForPrMerge from '../github-events/ztg-on-pr-merge.js';
import getNextConversationNumber from '../github-helpers/ztg-get-next-conversation-number.js';
import { getConversationNumber } from '../github-helpers/ztg-index.js';
import abortableClassName from '../helpers/ztg-abortable-classname.js';
import observe from '../helpers/ztg-selector-observer.js';
import { formatPrCommitTitle } from './ztg-sync-pr-commit-title.js';

// https://github.com/refined-github/refined-github/issues/2178#issuecomment-505940703
const limit = 72;

function validateCommitTitle({delegateTarget: field}) {
	field.classList.toggle('rgh-title-over-limit', field.value.length > limit);
}

async function validatePrTitle(field) {
	// Include the PR number in the title length calculation because it will be added to the commit title
	const prTitle = formatPrCommitTitle(
		field.value,
		getConversationNumber() ?? await getNextConversationNumber(),
	);
	field.classList.toggle('rgh-title-over-limit', prTitle.length > limit);
}

async function validatePrTitleDelegate({delegateTarget}) {
	await validatePrTitle(delegateTarget);
}

const currentPrTitleSelectors = [
	'[class^="prc-PageLayout-Header"] input', // `isPR`
	'input[name="pull_request[title]"]', // `isCompare`
] ;

async function init(signal) {
	abortableClassName(document.body, signal, 'rgh-suggest-commit-title-limit');

	onCommitTitleUpdate(validateCommitTitle, signal);

	delegate(
		currentPrTitleSelectors,
		'input',
		validatePrTitleDelegate,
		{signal, passive: true},
	);
	// `isPR` - input is added to the DOM when user enters editing mode and removed when they exit it
	// `isCompare` - input is re-rendered when previously entered title is restored
	observe(currentPrTitleSelectors, validatePrTitle, {signal});

	await waitForPrMerge(signal);
	features.unload(import.meta.url);
}

void features.add(import.meta.url, {
	include: [
		isEditingFile,
		isCompare,
		isPR,
	],
	exclude: [
		// No need here https://github.com/refined-github/refined-github/issues/7922
		isMergedPR,
	],
	// DOM-based checks; event-based feature
	awaitDomReady: true,
	init,
});

/*

# Test data

## Commit title

123456789 123456789 123456789 123456789 123456789 123456789 123456789 123

## Test URLs

- Any mergeable PR
	- https://github.com/refined-github/sandbox/pull/8
- Any editable file
	- Markown: https://github.com/refined-github/refined-github/edit/main/readme.md
	- Workflow: https://github.com/refined-github/refined-github/edit/fix-commit-title-limit/.github/workflows/features.yml
- Compare page
	- https://github.com/refined-github/sandbox/compare/default-a...fregante-patch-2?expand=1

*/
