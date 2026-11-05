import React from '../npm/ztg-dom-chef.js';
import { isEmptyRepoRoot, isRepoRoot } from '../npm/ztg-github-url-detection.js';
import RepoIcon from '../npm/ztg-octicons-plain-react-components-Repo.js';
import { closestElement } from '../npm/ztg-select-dom.js';
import twas from '../npm/ztg-twas-index.es.js';
import '../npm/ztg-webext-storage-cache.js';
import features from '../ztg-feature-manager.js';
import api from '../github-helpers/ztg-api.js';
import { cacheByRepo, buildRepoUrl } from '../github-helpers/ztg-index.js';
import { randomArrayItem } from '../helpers/ztg-math.js';
import observe from '../helpers/ztg-selector-observer.js';
import GetFirstCommit from './ztg-repo-age-first-commit.gql.js';
import GetRepoAge from './ztg-repo-age.gql.js';
import CachedFunction from '../npm/ztg-webext-storage-cache-cached-function.js';

const fresh = [
	'Freshly baked',
	'Freshly brewed',
	'Newly minted',
	'Hot off the presses',
	'Straight out of the oven',
	'Still hot',
	'Smells fresh',
	'Just a baby',
	'It’s my birthday',
	'Brand spanking new',
	'It’s a new world ✨',
	'Certified Fresh Repo™',
	'So it begins, the great battle of our time',
];

function buildLastCommitsPageUrl(commitSha, commitsCount) {
	if (commitsCount <= 2) {
		return buildRepoUrl('commits');
	}

	const offset = commitsCount - 2;
	return buildRepoUrl('commits', `?after=${commitSha}+${offset}`);
}

async function getRepoAge(
	commitSha,
	commitsCount,
) {
	const {repository} = await api.v4(GetRepoAge, {
		variables: {
			cursor: `${commitSha} ${commitsCount - Math.min(6, commitsCount)}`,
		},
	});

	const {committedDate} = repository.defaultBranchRef.target.history.nodes
		// Filter out any invalid commit dates #3185
		.findLast((commit) => new Date(commit.committedDate).getFullYear() > 1970);

	const lastCommitsPageUrl = buildLastCommitsPageUrl(commitSha, commitsCount);
	return [committedDate, lastCommitsPageUrl];
}

const firstCommit = new CachedFunction('first-commit', {
	async updater() {
		const {repository} = await api.v4(GetFirstCommit);

		const {oid: commitSha, history, committedDate} = repository.defaultBranchRef.target ;
		const commitsCount = history.totalCount;
		if (commitsCount === 1) {
			const lastCommitsPageUrl = buildLastCommitsPageUrl(commitSha, commitsCount);
			return [committedDate, lastCommitsPageUrl];
		}

		return getRepoAge(commitSha, commitsCount);
	},
	cacheKey: cacheByRepo,
});

async function addRepoAge(sidebarForksLinkIcon) {
	// Construct class only when it's needed, as it is relatively expensive
	const dateFormatter = new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});

	const [firstCommitDate, lastCommitsPageUrl] = await firstCommit.get();
	const birthday = new Date(firstCommitDate);

	// `twas` could also return `an hour ago` or `just now`
	const [value, unit] = twas(birthday.getTime())
		.replace('just now', '1 second')
		.replace(/^an?/, '1')
		.split(' ', 2);

	// About a day old or less ?
	const age = Date.now() - birthday.getTime() < 10e7
		? randomArrayItem(fresh)
		: React.createElement(React.Fragment, null
, React.createElement('strong', null, value), " " , unit, " old"
);

	closestElement('.mt-2', sidebarForksLinkIcon).after(
		React.createElement('h3', { className: "sr-only",}, "Repository age" ),
		React.createElement('div', { className: "mt-2 tmp-mt-2" ,}
, React.createElement('a', { href: lastCommitsPageUrl, className: "Link--muted", title: `First commit dated ${dateFormatter.format(birthday)}`,}
, React.createElement(RepoIcon, { className: "mr-2 tmp-mr-2" ,} ), " " , age
)
),
	);
}

async function init(signal) {
	// Use the observer because React replaces the sidebar’s subtree during hydration, discarding the element we inserted
	observe('[class*="PageLayout-Pane"] .octicon-repo-forked', addRepoAge, {signal});
}

void features.add(import.meta.url, {
	include: [
		isRepoRoot,
	],
	exclude: [
		isEmptyRepoRoot,
	],
	requiresToken: true,
	init,
});

/*

Test URLs:

https://github.com/refined-github/sandbox
https://github.com/refined-github/sandbox/tree/6619
https://github.com/bfred-it/bfred-it.github.io

*/
