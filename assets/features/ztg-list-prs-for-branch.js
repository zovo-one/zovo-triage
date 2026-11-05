import React from '../npm/ztg-dom-chef.js';
import features from '../ztg-feature-manager.js';
import getCurrentGitRef from '../github-helpers/ztg-get-current-git-ref.js';
import { isPermalink, isRepoCommitListRoot, addAfterBranchSelector } from '../github-helpers/ztg-index.js';
import isDefaultBranch from '../github-helpers/ztg-is-default-branch.js';
import { branchSelectorParent } from '../github-helpers/ztg-selectors.js';
import observe from '../helpers/ztg-selector-observer.js';
import { pullRequestsAssociatedWithBranch, stateIcon } from './ztg-show-associated-branch-prs-on-fork.js';

// Taken from https://github.com/fregante/github-issue-link-status/blob/98792f2837352bacbf80664f3edbcec8e579ed17/source/github-issue-link-status.js#L10
const stateColorMap = {
	/* eslint-disable @typescript-eslint/naming-convention -- The same case as in the API response */
	OPEN: 'color-fg-success',
	CLOSED: 'color-fg-danger',
	MERGED: 'color-fg-done',
	DRAFT: '',
	/* eslint-enable @typescript-eslint/naming-convention */
};

async function add(parent) {
	const prsByBranch = await pullRequestsAssociatedWithBranch.get();
	const currentBranch = getCurrentGitRef();
	const prInfo = prsByBranch[currentBranch];
	if (!prInfo) {
		return;
	}

	const StateIcon = stateIcon[prInfo.state];

	addAfterBranchSelector(
		parent,
		React.createElement('a', {
			'data-issue-and-pr-hovercards-enabled': true,
			href: prInfo.url,
			className: "btn flex-self-center rgh-list-prs-for-branch"  ,
			'data-hovercard-type': "pull_request",
			'data-hovercard-url': prInfo.url + '/hovercard',}

, React.createElement(StateIcon, { className: stateColorMap[prInfo.state],} )
, React.createElement('span', null, " #" , prInfo.number)
),
	);
}

async function init(signal) {
	observe(branchSelectorParent, add, {signal});
}

void features.add(import.meta.url, {
	include: [
		isRepoCommitListRoot,
	],
	exclude: [
		isDefaultBranch,
		isPermalink,
	],
	requiresToken: true,
	init,
});

/*

Test URLs

https://github.com/refined-github/sandbox/commits/4679-1
https://github.com/refined-github/sandbox/commits/branch/with/slashes

*/
