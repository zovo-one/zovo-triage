import batchedFunction from '../npm/ztg-batched-function.js';
import React from '../npm/ztg-dom-chef.js';
import { isIssueOrPRList } from '../npm/ztg-github-url-detection.js';
import GitPullRequestIcon from '../npm/ztg-octicons-plain-react-components-GitPullRequest.js';
import { elementExists, $, closestElement } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import api from '../github-helpers/ztg-api.js';
import abbreviateString from '../helpers/ztg-abbreviate-string.js';
import observe from '../helpers/ztg-selector-observer.js';

function getRow(prLink) {
	return closestElement([
		'.js-issue-row', // Legacy DOM
		'li',
	], prLink);
}

function isClosed(prLink) {
	return elementExists([
		// Legacy DOM
		'.octicon.merged',
		'.octicon.closed',
		// React DOM
		'.octicon-git-merge',
		'.octicon-git-pull-request-closed',
	], getRow(prLink));
}

// GitHub's own stacked PR indicator already says the PR isn't going to the default branch
function isStacked(prLink) {
	return elementExists('.octicon-stack', getRow(prLink));
}

function buildQuery(prsByRepo) {
	return [...prsByRepo.values()].map(prs => {
		const {owner, repo} = prs[0];
		return `
			${api.escapeKey('repo', owner, repo)}: repository(owner: "${owner}", name: "${repo}") {
				nameWithOwner
				defaultBranchRef { name }
					${
						prs.map(pr => `
						${api.escapeKey('pr', pr.number)}: pullRequest(number: ${pr.number}) {
							ref: baseRef { id }
							refName: baseRefName
						}
					`).join('\n')
					}
			}
		`;
	}).join('\n');
}

function renderBranches(pr, baseBranch, nameWithOwner) {
	const branch = baseBranch.ref && `/${nameWithOwner}/tree/${baseBranch.refName}`;
	const displayName = abbreviateString(baseBranch.refName, 25);

	const badge = (
		React.createElement('span', { className: "ml-2 tmp-ml-2" ,}
, React.createElement(GitPullRequestIcon, null )
, ' To '
, React.createElement('span', {
				className: "commit-ref user-select-contain mb-n1 tmp-mb-n1"   ,
				style: branch ? {} : {textDecoration: 'line-through'},}

, React.createElement('a', { title: branch ? baseBranch.refName : 'Deleted', href: branch,}
, displayName
)
)
)
	);

	const metadataRow = pr.link.matches('.js-issue-row *')
		// Legacy DOM
		? $('.text-small.color-fg-muted .d-none.d-md-inline-flex', pr.link.parentElement)
		// React DOM
		: closestElement('li', pr.link).querySelector([
			'div[data-testid="list-row-repo-name-and-number"]', // Issue list
			'div[class^="Description"]', // Preview global PR list
		]);
	metadataRow.append(badge);
}

async function add(prLinks) {
	const prs = new Set();
	for (const link of prLinks) {
		if (isStacked(link)) {
			continue;
		}

		const [, owner, repo, , number] = link.pathname.split('/', 5);
		prs.add({
			link,
			owner,
			repo,
			number: Number(number),
		});
	}

	if (prs.size === 0) {
		return;
	}

	const prsByRepo = Map.groupBy(prs, pr => `${pr.owner}/${pr.repo}`);
	const data = await api.v4(buildQuery(prsByRepo));

	for (const repoPrs of prsByRepo.values()) {
		const {owner, repo} = repoPrs[0];
		const repository = data[api.escapeKey('repo', owner, repo)];
		const defaultBranch = repository.defaultBranchRef.name;
		for (const pr of repoPrs) {
			const baseBranch = repository[api.escapeKey('pr', pr.number)];
			if (baseBranch.refName === defaultBranch) {
				continue;
			}

			// Avoid noise on old PRs pointing to `master` #3910
			// If the PR is open, it means that `master` still exists
			if (baseBranch.refName === 'master' && isClosed(pr.link)) {
				continue;
			}

			renderBranches(pr, baseBranch, repository.nameWithOwner);
		}
	}
}

async function init(signal) {
	observe(
		[
			'.js-issue-row a[data-hovercard-type="pull_request"]', // Repo and global PR lists
			'a[data-hovercard-type="pull_request"][data-testid="listitem-title-link"]', // Preview global PR list
			'a[data-hovercard-type="pull_request"][data-testid="issue-pr-title-link"]', // Issue list
		],
		batchedFunction(add, {delay: 100}),
		{signal},
	);
}

void features.add(import.meta.url, {
	include: [
		isIssueOrPRList,
	],
	requiresToken: true,
	init,
});

/*

Test URLs:

- Repo PR list: https://github.com/refined-github/sandbox/pulls?q=is%3Apr+non+default
- Repo issue list: https://github.com/refined-github/sandbox/issues?q=is%3Apr+non+default
- Global PR list: https://github.com/pulls?q=is%3Apr+repo%3Arefined-github%2Fsandbox+non+default
- Global issue list: https://github.com/issues?q=is%3Apr+repo%3Arefined-github%2Fsandbox+non+default
- Stacked PRs: https://github.com/carousell/rgh-stacked-pr-sandbox/pulls

*/
