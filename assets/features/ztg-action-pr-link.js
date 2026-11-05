import { isRepositoryActions, isPR } from '../npm/ztg-github-url-detection.js';
import { $, closestElement } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import { getConversationNumber } from '../github-helpers/ztg-index.js';
import observe from '../helpers/ztg-selector-observer.js';

function setSearchParameter(anchorElement, name, value) {
	const parameters = new URLSearchParams(anchorElement.search);
	parameters.set(name, value);
	anchorElement.search = String(parameters);
}

async function addForRepositoryActions(prLink) {
	const prNumber = prLink.textContent.slice(1);

	const runLink = $('a:has(.Link--primary)', closestElement('.Box-row', prLink));
	setSearchParameter(runLink, 'pr', prNumber);
}

async function addForPr(actionLink) {
	setSearchParameter(actionLink, 'pr', String(getConversationNumber()));
}

async function initForRepositoryActionsPage(signal) {
	observe('div.Box-row[id^=check_suite_] a[data-hovercard-type="pull_request"]', addForRepositoryActions, {signal});
}

async function initForPrPage(signal) {
	// Exclude rgh-link, include isPRCommits
	observe(
		[
			'main [href="/apps/github-actions"] ~ div a.status-actions', // Legacy
			'[data-testid="check-run-item"] a[href*="/actions/runs/"]', // React component on isPRCommits
		],
		addForPr,
		{signal},
	);
}

void features.add(import.meta.url, {
	include: [
		isRepositoryActions,
	],
	init: initForRepositoryActionsPage,
}, {
	include: [
		isPR,
	],
	init: initForPrPage,
});

/*

## Test URLs

https://github.com/refined-github/refined-github/actions

https://github.com/refined-github/refined-github/pull/6794

https://github.com/refined-github/refined-github/pull/6794/commits

https://github.com/refined-github/refined-github/actions/runs/19100812913/usage

*/
