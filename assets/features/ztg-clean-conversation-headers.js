import React from '../npm/ztg-dom-chef.js';
import elementReady from '../npm/ztg-element-ready.js';
import { isPR, isPRConversation, isClosedConversation } from '../npm/ztg-github-url-detection.js';
import ArrowLeftIcon from '../npm/ztg-octicons-plain-react-components-ArrowLeft.js';
import { closestElement, $, closestElementOptional } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import getDefaultBranch from '../github-helpers/ztg-get-default-branch.js';
import { parseReferenceRaw } from '../github-helpers/ztg-pr-branches.js';
import { wrap, assertNodeContent } from '../helpers/ztg-dom-utils.js';
import observe from '../helpers/ztg-selector-observer.js';

async function highlightNonDefaultBranchPrs(base, baseBranch) {
	const wasDefaultBranch = isClosedConversation() && baseBranch === 'master';
	const isDefaultBranch = baseBranch === await getDefaultBranch();
	if (!isDefaultBranch && !wasDefaultBranch) {
		base.classList.add('rgh-non-default-branch');
	}
}

async function removeBaseRepo(base) {
	const textNode = base.firstChild;
	if (!(textNode instanceof Text)) {
		throw new TypeError('Expected a text node');
	}

	const crossRepoPr = textNode.textContent.indexOf(':');
	if (crossRepoPr > 0) {
		textNode.splitText(crossRepoPr + 1);
		wrap(textNode, React.createElement('span', { className: "sr-only",} ));
	}
}

function isStickyHeader(childElement) {
	return Boolean(closestElementOptional('div[class*="stickyHeader"]', childElement));
}

/** The PR header username is the creator or the merger */
function getHeaderUsername(summaryRow) {
	return $('a', summaryRow);
}

const prCreatorSelector = [
	'.TimelineItem .author',
	'.Timeline-Item [data-testid="author-avatar"] a:not([data-testid="github-avatar"])',
] ;
async function getPrCreator() {
	return (await elementReady(prCreatorSelector)).textContent;
}

// Hide if it's the same as the opener (always) or merger
async function maybeHideAuthor(summaryRow) {
	// Extra author name is only shown on `isPRConversation`
	if (!isPRConversation()) {
		return;
	}

	// Keep author in sticky header
	// https://github.com/refined-github/refined-github/issues/7802
	if (isStickyHeader(summaryRow)) {
		return;
	}

	if (getHeaderUsername(summaryRow).textContent === await getPrCreator()) {
		summaryRow.classList.add('rgh-hide-author');
	}
}

async function hideAuthorMetadata(summaryRow) {
	for (const child of summaryRow.childNodes) {
		if (child instanceof Text && /^(?:wants to merge|merged) \d+ commit/.test(child.textContent)) {
			child.remove();
			return;
		}
	}

	throw new Error('Unable to find the PR metadata text node');
}

function replaceFromWithArrow(base) {
	const anchor = base.nextElementSibling.nextElementSibling ;
	assertNodeContent(anchor, 'from');
	// Don't remove element, GitHub requires it to change the base
	// https://github.com/refined-github/refined-github/issues/9688
	anchor.hidden = true;
	anchor.after(
		React.createElement(ArrowLeftIcon, { className: "v-align-middle mx-1 tmp-mx-1 rgh-arrow"   ,} ),
	);
}

async function cleanPrHeader(headRef) {
	const summaryRow = closestElement('.d-flex[class*="PullRequestHeaderSummary"]', headRef);
	summaryRow.classList.add('rgh-clean-conversation-headers');

	if (isStickyHeader(summaryRow)) {
		// Add class here to avoid duplicating the selectors into the CSS file
		summaryRow.classList.add('rgh-sticky-pr-header');
	}

	const base = $('[class^="PullRequestBranchName"]', summaryRow);

	// Add class here to avoid duplicating the selectors into the CSS file
	base.classList.add('rgh-base-branch');

	const baseBranch = parseReferenceRaw(
		base.title || base.nextElementSibling.textContent,
		base.textContent,
	).branch;

	// This can be run asynchronously
	void hideAuthorMetadata(summaryRow);
	void maybeHideAuthor(summaryRow);

	// Don't await https://github.com/refined-github/refined-github/issues/8331
	void highlightNonDefaultBranchPrs(base, baseBranch);
	void removeBaseRepo(base);

	// Shows on PRs: main [←] feature
	replaceFromWithArrow(base);
}

async function init(signal) {
	observe(
		'[class^="PullRequestBranchName"] ~ div [class^="PullRequestBranchName"]',
		cleanPrHeader,
		{signal},
	);
}

void features.add(import.meta.url, {
	include: [
		isPR,
	],
	requiresToken: true,
	init,
});

/* Test URLs

- Open PR (default branch): https://github.com/refined-github/sandbox/pull/4
- Open PR (non-default branch): https://github.com/Kenshin/simpread/pull/698

- Merged PR (same author): https://github.com/sindresorhus/refined-github/pull/3402
- Merged PR (different author): https://github.com/parcel-bundler/parcel/pull/78
- Merged PR (different author + first published tag): https://github.com/sindresorhus/refined-github/pull/3227

- Closed PR: https://github.com/sindresorhus/refined-github/pull/4141

*/
