import React from '../npm/ztg-dom-chef.js';
import { isIssueOrPRList, isIssue } from '../npm/ztg-github-url-detection.js';
import { $, closestElement } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import { commentsCountInLists, commentBoxHashIssue, commentBoxHashPr } from '../github-helpers/ztg-selectors.js';
import { wrapAll } from '../helpers/ztg-dom-utils.js';
import observe from '../helpers/ztg-selector-observer.js';

function getHash(type) {
	return type === 'issue' ? commentBoxHashIssue : commentBoxHashPr;
}

function linkify(item) {
	if (item instanceof HTMLAnchorElement) {
		// Only PR lists are already linked
		item.hash = getHash('pr');
	} else {
		// The box hash must be determine by conversation type because (React) issue lists might contain links to PRs too
		const conversationLink = $([
			'a[href*="/issues/"]',
			'a[href*="/pull/"]',
		], closestElement('li', item));
		const url = new URL(conversationLink.href);
		const type = isIssue(url) ? 'issue' : 'pr';
		url.hash = getHash(type);
		wrapAll(React.createElement('a', { href: url.href, className: "Link--muted d-flex gap-1"  ,} ), ...item.childNodes);
	}
}

function init(signal) {
	observe(commentsCountInLists, linkify, {signal});
}

void features.add(import.meta.url, {
	include: [
		isIssueOrPRList,
	],
	init,
});

/*

Test URLs:

- issues https://github.com/refined-github/sandbox/issues?q=is%3Aissue%20%22open-issue-to-latest-comment%22
- pulls https://github.com/refined-github/sandbox/pulls?q=is%3Apr%20%22open-issue-to-latest-comment%22
- mixed https://github.com/refined-github/sandbox/issues?q=%22open-issue-to-latest-comment%22%202%20comments

Test 0, 1, 2+ comments

*/
