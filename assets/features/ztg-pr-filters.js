import React from '../npm/ztg-dom-chef.js';
import { isPRList } from '../npm/ztg-github-url-detection.js';
import CheckIcon from '../npm/ztg-octicons-plain-react-components-Check.js';
import { $ } from '../npm/ztg-select-dom.js';
import '../npm/ztg-webext-storage-cache.js';
import features from '../ztg-feature-manager.js';
import api from '../github-helpers/ztg-api.js';
import { cacheByRepo } from '../github-helpers/ztg-index.js';
import SearchQuery from '../github-helpers/ztg-search-query.js';
import observe from '../helpers/ztg-selector-observer.js';
import HasChecks from './ztg-pr-filters.gql.js';
import CachedFunction from '../npm/ztg-webext-storage-cache-cached-function.js';

const reviewsFilterSelector = '#reviews-select-menu';

function addDropdownItem(dropdown, title, filterCategory, filterValue) {
	const filterQuery = `${filterCategory}:${filterValue}`;

	const searchQuery = SearchQuery.from(location);
	const isSelected = searchQuery.includes(filterQuery);

	const filtersToRemove = searchQuery.getQueryParts().filter(part => part.startsWith(`${filterCategory}:`));
	searchQuery.remove(...filtersToRemove);

	if (!isSelected) {
		searchQuery.append(filterQuery);
	}

	dropdown.append(
		React.createElement('a', {
			href: searchQuery.href,
			className: "SelectMenu-item",
			'aria-checked': isSelected ? 'true' : 'false',
			role: "menuitemradio",}

, React.createElement(CheckIcon, { className: "SelectMenu-icon SelectMenu-icon--check" ,} )
, React.createElement('span', null, title)
),
	);
}

function addDraftFilter(dropdown) {
	dropdown.append(
		React.createElement('div', { className: "SelectMenu-divider",}, "Filter by draft pull requests"

),
	);

	addDropdownItem(dropdown, 'Ready for review', 'draft', 'false');
	addDropdownItem(dropdown, 'Not ready for review (Draft PR)', 'draft', 'true');
}

const hasChecks = new CachedFunction('has-checks', {
	async updater() {
		const {repository} = await api.v4(HasChecks);

		return repository.head.history.nodes.some((commit) => commit.statusCheckRollup);
	},
	maxAge: {days: 3},
	cacheKey: cacheByRepo,
});

async function addChecksFilter(reviewsFilter) {
	if (!await hasChecks.get()) {
		return;
	}

	// Copy existing element and adapt its content
	const checksFilter = reviewsFilter.cloneNode(true);
	checksFilter.id = '';

	$('summary', checksFilter).firstChild.textContent = 'Checks\u{A0}'; // Only replace text node, keep caret
	$('.SelectMenu-title', checksFilter).textContent = 'Filter by checks status';

	const dropdown = $('.SelectMenu-list', checksFilter);
	dropdown.textContent = ''; // Drop previous filters

	for (const status of ['Success', 'Failure', 'Pending']) {
		addDropdownItem(dropdown, status, 'status', status.toLowerCase());
	}

	reviewsFilter.after(checksFilter);
}

async function init(signal) {
	observe(reviewsFilterSelector, addChecksFilter, {signal});
	observe(`${reviewsFilterSelector} .SelectMenu-list`, addDraftFilter, {signal});
}

void features.add(import.meta.url, {
	include: [
		isPRList,
	],
	requiresToken: true,
	init,
});

/*

Test URLs:

https://github.com/pulls
https://github.com/refined-github/refined-github/pulls

*/
