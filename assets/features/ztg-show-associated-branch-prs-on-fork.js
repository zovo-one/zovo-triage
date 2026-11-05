import { clsx } from '../npm/ztg-clsx-clsx.js';
import React from '../npm/ztg-dom-chef.js';
import { isBranches, isForkedRepo } from '../npm/ztg-github-url-detection.js';
import memoize from '../npm/ztg-memoize.js';
import GitMergeIcon from '../npm/ztg-octicons-plain-react-components-GitMerge.js';
import GitPullRequestIcon from '../npm/ztg-octicons-plain-react-components-GitPullRequest.js';
import GitPullRequestClosedIcon from '../npm/ztg-octicons-plain-react-components-GitPullRequestClosed.js';
import GitPullRequestDraftIcon from '../npm/ztg-octicons-plain-react-components-GitPullRequestDraft.js';
import RepoForkedIcon from '../npm/ztg-octicons-plain-react-components-RepoForked.js';
import { closestElement } from '../npm/ztg-select-dom.js';
import '../npm/ztg-webext-storage-cache.js';
import features from '../ztg-feature-manager.js';
import api from '../github-helpers/ztg-api.js';
import { cacheByRepo } from '../github-helpers/ztg-index.js';
import observe from '../helpers/ztg-selector-observer.js';
import AssociatedPullRequests from './ztg-show-associated-branch-prs-on-fork.gql.js';
import CachedFunction from '../npm/ztg-webext-storage-cache-cached-function.js';

const pullRequestsAssociatedWithBranch = new CachedFunction('associatedBranchPullRequests', {
	async updater() {
		const {repository} = await api.v4(AssociatedPullRequests);

		const pullRequests = {};
		for (const {name, associatedPullRequests} of repository.refs.nodes) {
			const [prInfo] = associatedPullRequests.nodes;
			// Check if the ref was deleted, since the result includes pr's that are not in fact related to this branch but rather to the branch name.
			const wasHeadRefDeleted = prInfo?.timelineItems.nodes[0]?.__typename === 'HeadRefDeletedEvent';
			if (prInfo && !wasHeadRefDeleted) {
				pullRequests[name] = {
					number: prInfo.number,
					state: prInfo.isDraft && prInfo.state === 'OPEN' ? 'DRAFT' : prInfo.state,
					isDraft: prInfo.isDraft,
					url: prInfo.url,
				};
			}
		}

		return pullRequests;
	},
	maxAge: {hours: 1},
	staleWhileRevalidate: {days: 4},
	cacheKey: cacheByRepo,
});

const stateIcon = {
	/* eslint-disable @typescript-eslint/naming-convention -- The same case as in the API response */
	OPEN: GitPullRequestIcon,
	CLOSED: GitPullRequestClosedIcon,
	MERGED: GitMergeIcon,
	DRAFT: GitPullRequestDraftIcon,
	/* eslint-enable @typescript-eslint/naming-convention */
};

async function addLink(branch) {
	const prs = await pullRequestsAssociatedWithBranch.get();
	const branchName = branch.getAttribute('title');
	const prInfo = prs[branchName];
	if (!prInfo) {
		return;
	}

	const StateIcon = stateIcon[prInfo.state] ?? (() => {/* empty */});
	const stateClassName = prInfo.state.toLowerCase();

	const cell = closestElement('tr.TableRow', branch)
		.children
		.item(4);

	cell.classList.add('rgh-pr-cell');
	cell.append(
		React.createElement('div', { className: "rgh-pr-box",}
, React.createElement('a', {
				href: prInfo.url,
				'data-hovercard-url': prInfo.url + '/hovercard',
				'aria-label': `Link to the ${prInfo.isDraft ? 'draft ' : ''}pull request #${prInfo.number}`,
				className: "rgh-pr-link",}

, React.createElement(StateIcon, { width: 14, height: 14, className: stateClassName,} )
, React.createElement(RepoForkedIcon, { width: 14, height: 14, className: clsx('mr-1 tmp-mr-1', stateClassName),} ), "#"
, prInfo.number
)
),
	);
}

async function init(signal) {
	// Memoize because it's being called twice for each. Ideally this should be part of the selector observer
	// https://github.com/refined-github/refined-github/pull/7194#issuecomment-1894972091
	observe('react-app[app-name=repos-branches] a[class*=BranchName] div[title]', memoize(addLink), {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		isForkedRepo,
	],
	include: [
		isBranches,
	],
	requiresToken: true,
	init,
});

/*

Test URLs:

https://github.com/bfred-it-org/github-sandbox/branches

*/

export { pullRequestsAssociatedWithBranch, stateIcon };
