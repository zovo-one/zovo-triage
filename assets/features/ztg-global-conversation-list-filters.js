import React from '../npm/ztg-dom-chef.js';
import { isGlobalIssueOrPRList, isPRList } from '../npm/ztg-github-url-detection.js';
import { elementExists, $$ } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import SearchQuery from '../github-helpers/ztg-search-query.js';
import observe from '../helpers/ztg-selector-observer.js';

function createLink(label, title, query) {
	const url = new URL('/pulls', location.origin);
	url.searchParams.set('q', `is:pr state:open archived:false ${query}`);
	const link = React.createElement('a', { href: url.href, title: title, className: "subnav-item",}, label);

	const isCurrentPage = SearchQuery.from(location).includes(query);

	// Highlight it, if that's the current page
	if (isCurrentPage && !elementExists('.subnav-links .selected')) {
		link.classList.add('selected');

		// Other links will keep the current query, that's not what we want
		for (const otherLink of $$('.subnav-links a')) {
			otherLink.href = SearchQuery.from(otherLink).remove(query).href;
		}
	}

	return link;
}

function addLinks(container) {
	container.append(
		createLink('Involved', 'Pull Requests you’re involved in', 'involves:@me'),
		createLink('Yours', 'Pull Requests on your repos', 'user:@me'),
	);
}

function init(signal) {
	observe('.subnav-links', addLinks, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		isGlobalIssueOrPRList,
		isPRList, // We don't have a single `isGlobalPRList`
	],
	init,
});

/*

Test URLs:

https://github.com/pulls

*/
