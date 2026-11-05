import React from '../npm/ztg-dom-chef.js';
import elementReady from '../npm/ztg-element-ready.js';
import { isForkedRepo, isRepoMainSettings, canUserAccessRepoSettings } from '../npm/ztg-github-url-detection.js';
import { $ } from '../npm/ztg-select-dom.js';
import '../npm/ztg-webext-storage-cache.js';
import features from '../ztg-feature-manager.js';
import api from '../github-helpers/ztg-api.js';
import { getRepo, getLoggedInUser, getForkedRepo } from '../github-helpers/ztg-index.js';
import pluralize from '../helpers/ztg-pluralize.js';
import observe from '../helpers/ztg-selector-observer.js';
import GetPRs from './ztg-show-open-prs-of-forks.gql.js';
import CachedFunction from '../npm/ztg-webext-storage-cache-cached-function.js';

const countPrs = new CachedFunction('prs-on-forked-repo', {
	async updater(forkedRepo) {
		const {search} = await api.v4(GetPRs, {
			variables: {
				query: `is:pr state:open archived:false repo:${forkedRepo} author:${getLoggedInUser()}`,
			},
		});

		// Only show PRs originated from the current repo
		const prs = search.nodes.filter((pr) => pr.headRepository.nameWithOwner === getRepo().nameWithOwner);

		// If only one is found, pass the PR number so we can link to the PR directly
		if (prs.length === 1) {
			return {count: 1, firstPr: prs[0].number};
		}

		return {count: prs.length};
	},
	maxAge: {hours: 1},
	staleWhileRevalidate: {days: 2},
	cacheKey: ([forkedRepo]) => `${forkedRepo}:${getRepo().nameWithOwner}`,
});

// eslint-disable-next-line @typescript-eslint/no-restricted-types
async function getPrs() {
	// Wait for the tab bar to be loaded
	// Maybe replace with https://github.com/refined-github/github-url-detection/issues/85
	await elementReady('.UnderlineNav-body');
	if (!canUserAccessRepoSettings()) {
		return [];
	}

	const forkedRepo = getForkedRepo();
	const {count, firstPr} = await countPrs.get(forkedRepo);
	if (count === 1) {
		return [count, `/${forkedRepo}/pull/${firstPr}`];
	}

	const url = new URL(`/${forkedRepo}/pulls`, location.origin);
	url.searchParams.set('q', 'is:pr state:open author:@me');
	return [count, url.href];
}

async function initHeadHint(signal) {
	const [count, url] = await getPrs();
	if (!count) {
		return false;
	}

	// Use the observer because GitHub randomly updates the header and removes the hint after load
	observe(`[data-hovercard-type="repository"][href="/${getForkedRepo()}"]`, (repoHeader) => {
		repoHeader.after(
			' with ',
			React.createElement('a', { href: url,}, pluralize(count, 'one open pull request', '$$+ open pull requests')),
		);
	}, {signal});
}

async function initDeleteHint() {
	const [count, url] = await getPrs();
	if (!count) {
		return false;
	}

	$('#repo-delete-proceed-button-container').before(
		React.createElement('p', { className: "flash flash-warn" ,}, "It will also close your "
     , React.createElement('a', { href: url,}, pluralize(count, 'open pull request', '$$+ open pull requests')), " in "  , React.createElement('strong', null, getForkedRepo()), "."
),
	);
}

void features.add(import.meta.url, {
	asLongAs: [
		isForkedRepo,
	],
	requiresToken: true,
	init: initHeadHint,
}, {
	asLongAs: [
		isForkedRepo,
	],
	include: [
		isRepoMainSettings,
	],
	requiresToken: true,
	init: initDeleteHint,
});

/*

Test URLs:

1. Visit https://github.com/pulls?q=is%3Apr+is%3Aopen+author%3A%40me+archived%3Afalse+-user%3A%40me
2. Find a PR made from a fork
3. In it, open your own fork

*/
