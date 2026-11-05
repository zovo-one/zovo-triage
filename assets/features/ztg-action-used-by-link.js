import React from '../npm/ztg-dom-chef.js';
import { isMarketplaceAction } from '../npm/ztg-github-url-detection.js';
import SearchIcon from '../npm/ztg-octicons-plain-react-components-Search.js';
import { $, closestElement, $$ } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import observe from '../helpers/ztg-selector-observer.js';

function getActionUrl(repoLink) {
	const actionRepo = repoLink.pathname.slice(1);

	const actionUrl = new URL('search', location.origin);
	actionUrl.search = new URLSearchParams({
		q: `${actionRepo} path:.github/workflows/ language:YAML`,
		type: 'Code',
		s: 'indexed',
		o: 'desc',
	}).toString();

	return actionUrl;
}

function cleanElement(element) {
	for (const child of $$(['[id]', '[aria-labelledby]'], element)) {
		child.removeAttribute('id');
		child.removeAttribute('aria-labelledby');
	}
}

function addUsageLink(repoItem) {
	const usageItem = repoItem.cloneNode(true);
	cleanElement(usageItem);
	const usageLink = $('a', usageItem);
	usageLink.href = getActionUrl(usageLink).href;
	$('[data-component="ActionList.Item.Label"]', usageItem).textContent = 'Usage examples';
	$('[data-component="ActionList.LeadingVisual"]', usageItem).replaceChildren(React.createElement(SearchIcon, null ));

	closestElement('ul', repoItem).append(usageItem);
}

function init(signal) {
	observe('[data-testid="resources"] [data-component="ActionList.Item"]:has(.octicon-repo)', addUsageLink, {signal});
}

void features.add(import.meta.url, {
	include: [
		isMarketplaceAction,
	],
	init,
});

/*

Test URLs:

https://github.com/marketplace/actions/title-replacer

*/
