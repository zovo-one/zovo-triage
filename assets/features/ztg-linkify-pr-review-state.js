import React from '../npm/ztg-dom-chef.js';
import { isRepoIssueOrPRList } from '../npm/ztg-github-url-detection.js';
import { $ } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import { buildRepoUrl } from '../github-helpers/ztg-index.js';
import SearchQuery from '../github-helpers/ztg-search-query.js';
import { wrap } from '../helpers/ztg-dom-utils.js';
import observe from '../helpers/ztg-selector-observer.js';

const reviewStateFilters = new Map([
	['Changes requested', 'review:changes-requested'],
	['Approved', 'review:approved'],
	['Review required', 'review:required'],

	// Missing from new view
	['Draft', 'draft:true'],
	// Not shown currently
	// [/^Awaiting review by you$/, 'review-requested:@me'],
]);

function alterLink(label) {
	for (const [text, filter] of reviewStateFilters) {
		// Use .textContent because "Draft" lacks any unique attributes
		if (label.textContent.trim() !== text) {
			continue;
		}

		const url = new SearchQuery(buildRepoUrl('pulls')).append(filter).href;
		if (label instanceof HTMLAnchorElement) {
			label.href = url;
			continue;
		}

		wrap(label, React.createElement('a', { href: url,} ));
		$('[class*="statusText"]', label).classList.add('Link--onHover');
	}
}

function init(signal) {
	observe(
		[
			'span[class^="ReviewDecision-module__reviewDecisionContent"]',

			// Note: This feature alters the `href` so this selector cannot be used by any other features
			// TODO [2027-01-01]: Drop selector when the old PR list is removed
			'.js-issue-row .text-small a[href$="#partial-pull-merging"]',
		],
		alterLink,
		{signal},
	);
}

void features.add(import.meta.url, {
	include: [
		isRepoIssueOrPRList,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/sandbox/pulls?q=is%3Apr+%22linkify-pr-review-state%22

*/
