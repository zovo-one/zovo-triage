import React from '../npm/ztg-dom-chef.js';
import { isUserProfileRepoTab, isGlobalSearchResults } from '../npm/ztg-github-url-detection.js';
import GitPullRequestIcon from '../npm/ztg-octicons-plain-react-components-GitPullRequest.js';
import IssueOpenedIcon from '../npm/ztg-octicons-plain-react-components-IssueOpened.js';
import { closestElement, $optional, $ } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import { assertNodeContent } from '../helpers/ztg-dom-utils.js';
import observe from '../helpers/ztg-selector-observer.js';

function addConversationLinks(repositoryLink) {
	const repository = closestElement('li', repositoryLink);

	// Remove the "X issues need help" link
	$optional('[href*="issues?q=label%3A%22help+wanted"]', repository)?.remove();

	// Place before the update date
	assertNodeContent(
		$('relative-time', repository).previousSibling,
		'Updated',
	).before(
		React.createElement('a', {
			className: "Link--muted mr-3 tmp-mr-3"  ,
			href: repositoryLink.href + '/issues',}

, React.createElement(IssueOpenedIcon, null )
),
		React.createElement('a', {
			className: "Link--muted mr-3 tmp-mr-3"  ,
			href: repositoryLink.href + '/pulls',}

, React.createElement(GitPullRequestIcon, null )
),
	);
}

function addSearchConversationLinks(stargazersLink) {
	closestElement('li', stargazersLink).after(
		React.createElement('span', {
			'aria-hidden': "true",
			className: "color-fg-muted mx-2 tmp-mx-2"  ,}
, "·"

),
		React.createElement('li', { className: "d-flex text-small" ,}
, React.createElement('a', {
				className: "Link--muted",
				href: stargazersLink.href + '/issues',}

, React.createElement(IssueOpenedIcon, null )
)
),
		React.createElement('li', { className: "d-flex text-small ml-2 tmp-ml-2"   ,}
, React.createElement('a', {
				className: "Link--muted",
				href: stargazersLink.href + '/pulls',}

, React.createElement(GitPullRequestIcon, null )
)
),
	);
}

function init(signal) {
	observe('a[itemprop="name codeRepository"]', addConversationLinks, {signal});
}

function initSearch(signal) {
	observe('a[class^="Repositories-module__stargazersLink"]', addSearchConversationLinks, {signal});
}

void features.add(import.meta.url, {
	include: [
		isUserProfileRepoTab, // Organizations already have these links
	],
	init,
}, {
	asLongAs: [
		isGlobalSearchResults,
		() => new URLSearchParams(location.search).get('type') === 'repositories',
	],
	init: initSearch,
});

/*
Test URLs

isProfileRepoList:
https://github.com/fregante?tab=repositories

isGlobalSearchResults:
https://github.com/search?q=fregante
*/
