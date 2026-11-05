import { clsx } from '../npm/ztg-clsx-clsx.js';
import delegate from '../npm/ztg-delegate-it-delegate.js';
import React from '../npm/ztg-dom-chef.js';
import { isIssueOrPRList } from '../npm/ztg-github-url-detection.js';
import { closestElementOptional, $$ } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import openTabs from '../helpers/ztg-open-tabs.js';
import observe from '../helpers/ztg-selector-observer.js';

function onButtonClick() {
	const links = $$([
		'a[data-testid="issue-pr-title-link"]',
		// TODO [2027-01-01]: Drop if PR lists have turned React
		'a.h4.js-navigation-open',
	]);

	if (links.length > 25) {
		console.warn('Selected too many links. Is the selector still correct?');
	}

	const selectedLinks = links.filter(link =>
		closestElementOptional([
			// TODO [2027-01-01]: Drop if PR lists have turned React
			'.js-issue-row.selected',
			'[aria-label^="Selected"]',
		], link),
	);

	const linksToOpen = selectedLinks.length > 0
		? selectedLinks
		: links;

	const urls = linksToOpen.map(link => link.href);
	void openTabs(urls);
}

function add(anchor) {
	// TODO: Drop after https://github.com/refined-github/refined-github/issues/9893
	if (closestElementOptional('[class*="RepositoryViews"]', anchor)) {
		// The user navigate to https://github.com/refined-github/refined-github/issues/views but the previous observer was not unloaded
		return;
	}

	const isLegacy = closestElementOptional('.table-list-header-toggle', anchor);
	const isSelected = closestElementOptional([
		// TODO [2027-01-01]: Drop if PR lists have turned React
		'.table-list-triage',
		'[aria-label="Bulk actions"]',
	], anchor);
	const classes = isLegacy
		? 'btn-link px-2'
		: isSelected
			? 'btn'
			: 'btn btn-sm';
	anchor.prepend(
		React.createElement('button', {
			type: "button",
			className: clsx('rgh-open-all-conversations', classes),}

, isSelected
				? 'Open selected'
				: 'Open all'
),
	);
}

async function init(signal) {
	observe(
		[
			// TODO [2027-01-01]: Drop if PR lists have turned React
			'.table-list-header-toggle:not(.states)',
			'[aria-label="Bulk actions"] > :first-child',
			'[aria-label="Actions"] > :first-child',
		],
		add,
		{signal},
	);
	delegate('button.rgh-open-all-conversations', 'click', onButtonClick, {signal});
}

void features.add(import.meta.url, {
	include: [
		isIssueOrPRList,
	],
	init,
});

/*

Test URLs:

- Global: https://github.com/issues
- Issues: https://github.com/refined-github/refined-github/issues
- PRs: https://github.com/refined-github/refined-github/pulls
- Nothing to open: https://github.com/fregante/empty/pulls

*/
