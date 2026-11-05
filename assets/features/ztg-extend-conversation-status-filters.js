import React from '../npm/ztg-dom-chef.js';
import { isRepoIssueOrPRList, isGlobalIssueOrPRList, isPRList } from '../npm/ztg-github-url-detection.js';
import CheckIcon from '../npm/ztg-octicons-plain-react-components-Check.js';
import { $ } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import SearchQuery from '../github-helpers/ztg-search-query.js';
import observe from '../helpers/ztg-selector-observer.js';
import setStatusFilter from '../helpers/ztg-set-status-filter.js';

function addMergeLink(lastLink) {
	// It's shouldn't be added in issues list
	if (!isPRList()) {
		return;
	}

	const locationQuery = SearchQuery.from(location);
	const isMerged = locationQuery.includes('is:merged', 'state:merged');

	// The links in `.table-list-header-toggle` are either:
	//   1 Open | 1 Closed
	//   1 Total            // Apparently appears with merged/unmerged filters
	if (isMerged) {
		// It's a "Total" link for a merged filter
		lastLink.lastChild.textContent = lastLink.lastChild.textContent.replace('Total', 'Merged');
		return;
	}

	const isUnmerged = locationQuery.includes('is:unmerged', '-state:merged');
	if (isUnmerged) {
		// It's a "Total" link for an unmerged filter
		lastLink.lastChild.textContent = lastLink.lastChild.textContent.replace('Total', 'Unmerged');
		return;
	}

	// In this case, `lastLink` is expected to be a "Closed" link
	const mergeLink = lastLink.cloneNode(true);
	mergeLink.textContent = 'Merged';
	mergeLink.classList.toggle('selected', isMerged);
	mergeLink.href = SearchQuery.from(mergeLink).replace(/(?:is|state):closed/, 'state:merged').href;
	lastLink.after(' ', mergeLink);
}

function removeAllFilters(link) {
	if (link === link.parentElement.lastElementChild) {
		addMergeLink(link);
	}

	$('.octicon', link).remove();
	if (link.classList.contains('selected')) {
		link.prepend(React.createElement(CheckIcon, null ));
		link.href = setStatusFilter(link);
	}
}

function init(signal) {
	observe('.table-list-header-toggle.states a', removeAllFilters, {signal});
}

void features.add(import.meta.url, {
	include: [
		isRepoIssueOrPRList,
		isGlobalIssueOrPRList,
	],
	init,
});

/*

Test URLs:

- Regular: https://github.com/sindresorhus/refined-github/pulls
- "Merged" view: https://github.com/sindresorhus/refined-github/pulls?q=is%3Apr+sort%3Aupdated-desc+state%3Amerged

*/
