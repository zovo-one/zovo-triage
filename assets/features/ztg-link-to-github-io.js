import React from '../npm/ztg-dom-chef.js';
import { isEnterprise, isRepoHome, isProfileRepoList, isOrganizationProfile } from '../npm/ztg-github-url-detection.js';
import LinkIcon from '../npm/ztg-octicons-plain-react-components-Link.js';
import features from '../ztg-feature-manager.js';
import { getRepo } from '../github-helpers/ztg-index.js';
import observe from '../helpers/ztg-selector-observer.js';

function getLinkToGitHubIo(repoTitle, className) {
	return (
		React.createElement('a', {
			href: `https://${repoTitle.textContent.trim().replace(/com$/, 'io')}`,
			className: className,}

, React.createElement(LinkIcon, { className: "v-align-middle",} )
)
	);
}

function addRepoListLink(repoTitle) {
	repoTitle.after(' ', getLinkToGitHubIo(repoTitle));
}

function addOrgRepoListLink(repoTitle) {
	repoTitle.after(getLinkToGitHubIo(repoTitle, 'ml-1'));
}

function addRepoHeaderLink(repoTitle) {
	repoTitle.after(getLinkToGitHubIo(repoTitle, 'mr-2'));
}

function initRepo(signal) {
	observe('[itemprop="name"]', addRepoHeaderLink, {signal});
}

function initRepoList(signal) {
	observe(
		[
			// Earlier GitHub Pages were hosted on github.com #6228
			'a[itemprop="name codeRepository"][href$=".github.com"]',
			'a[itemprop="name codeRepository"][href$=".github.io"]',
		],
		addRepoListLink,
		{signal},
	);
	observe(
		[
			'a[data-testid="listitem-title-link"][href$=".github.com"]',
			'a[data-testid="listitem-title-link"][href$=".github.io"]',
		],
		addOrgRepoListLink,
		{signal},
	);
}

void features.add(import.meta.url, {
	asLongAs: [
		isRepoHome,
		() => /\.github\.(?:io|com)$/.test(getRepo().name ?? 'shush eslint'),
	],
	exclude: [
		isEnterprise,
	],
	init: initRepo,
}, {
	include: [
		isProfileRepoList,
		isOrganizationProfile,
	],
	exclude: [
		isEnterprise,
	],
	init: initRepoList,
});

/*

Test URLs:

- Repo: https://github.com/yashshah1/yashshah1.github.io
- List, user: https://github.com/yashshah1?tab=repositories&q=GitHub.io&type=source
- List, org: https://github.com/Qv2ray?q=GitHub.io
- List, org repos: https://github.com/orgs/Qv2ray/repositories?q=GitHub.io

*/
