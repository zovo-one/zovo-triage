import { hasRepoHeader } from '../npm/ztg-github-url-detection.js';
import '../npm/ztg-webext-storage-cache.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { writable } from '../npm/ztg-svelte-store-shared.js';
import features from '../ztg-feature-manager.js';
import api from '../github-helpers/ztg-api.js';
import { cacheByRepo, buildRepoUrl } from '../github-helpers/ztg-index.js';
import fetchDom from '../helpers/ztg-fetch-dom.js';
import looseParseInt from '../helpers/ztg-loose-parse-int.js';
import { overrideTab } from '../components/ztg-extensible-nav-store.js';
import { expectTokenScope } from '../github-helpers/ztg-github-token.js';
import RepoCountInfo from './ztg-extend-repo-tabs.gql.js';
import CachedFunction from '../npm/ztg-webext-storage-cache-cached-function.js';

const cacheOptions = {
	maxAge: {days: 1},
	staleWhileRevalidate: {days: 10},
	cacheKey: cacheByRepo,
} ;

const repoTabsCounts = new CachedFunction('repo-tabs-counts', {
	async updater() {
		await expectTokenScope('read:project');
		const {repository} = await api.v4(RepoCountInfo);

		return {
			// Projects undefined if not enabled in the repo
			projects: repository.projectsV2?.totalCount ?? 0,
			actionRuns: repository.defaultBranchRef.target.checkSuites.totalCount,
		};
	},
	...cacheOptions,
});

const wikiPageCount = new CachedFunction('wiki-page-count', {
	async updater() {
		// No v3/v4 API access at all
		const counter = await fetchDom(buildRepoUrl('wiki'), '#wiki-pages-box .Counter');
		return looseParseInt(counter);
	},
	...cacheOptions,
});

async function updateWikiTab() {
	const count = await wikiPageCount.get();
	if (count > 0) {
		overrideTab('wiki', {counter: writable(count)});
	} else {
		overrideTab('wiki', {demoted: 'empty'});
	}
}

async function updateActionsAndProjectsTabs() {
	const {projects, actionRuns} = await repoTabsCounts.get();

	if (actionRuns === 0) {
		overrideTab('actions', {demoted: 'unused'});
	}

	if (projects > 0) {
		overrideTab('projects', {counter: writable(projects)});
	} else {
		overrideTab('projects', {demoted: 'none'});
	}
}

function init() {
	overrideTab('pull-requests', {label: 'Pulls'});
	overrideTab('security-and-quality', {demoted: true});
	overrideTab('insights', {demoted: true});

	void updateWikiTab();
	void updateActionsAndProjectsTabs();
}

void features.add(import.meta.url, {
	include: [
		hasRepoHeader,
	],
	// The feature partially works without a token
	// requiresToken: true,
	init,
});

/*

Test URLs:

- Repo with 0 projects: https://github.com/babel/flavortown
- Repo with some projects: https://github.com/github/docs/projects
- Repo with 0 wiki: https://github.com/babel/babel-sublime-snippets
- Repo with some wiki: https://github.com/refined-github/refined-github
- Repo with 0 actions: https://github.com/babel/jade-babel
- Repo with security alerts: https://github.com/babel/babel

*/
