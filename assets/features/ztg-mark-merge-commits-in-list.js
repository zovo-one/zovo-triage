import batchedFunction from '../npm/ztg-batched-function.js';
import React from '../npm/ztg-dom-chef.js';
import { isCommitList, isPRConversation, isCompare } from '../npm/ztg-github-url-detection.js';
import GitMergeIcon from '../npm/ztg-octicons-plain-react-components-GitMerge.js';
import { $ } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import api from '../github-helpers/ztg-api.js';
import { assertCommitHash } from '../github-helpers/ztg-index.js';
import { commitHashLinkInLists, commitTitleInLists } from '../github-helpers/ztg-selectors.js';
import observe from '../helpers/ztg-selector-observer.js';
import { objectEntries } from '../npm/ztg-ts-extras-object-entries.js';

const filterMergeCommits = async (commits) => {
	const {repository} = await api.v4(`
		repository() {
			${
				commits.map((commit) => `
					${api.escapeKey(commit)}: object(expression: "${commit}") {
					... on Commit {
							parents {
								totalCount
							}
						}
					}
				`).join('\n')
			}
		}
	`);

	const mergeCommits = [];
	for (const [key, commit] of objectEntries(repository)) {
		if (commit.parents.totalCount >= 2) {
			mergeCommits.push(key.slice(1));
		}
	}

	return mergeCommits;
};

function getCommitHash(commit) {
	const hash = $(commitHashLinkInLists, commit).pathname.split('/').pop();
	assertCommitHash(hash);
	return hash;
}

function updateCommitIcon(commit, replace) {
	if (replace) {
		$('.octicon-git-commit', commit).replaceWith(React.createElement(GitMergeIcon, null ));
	} else {
		$(commitTitleInLists, commit).prepend(React.createElement(GitMergeIcon, { className: "mr-2 tmp-mr-2" ,} ));
	}
}

async function markCommits(commits) {
	const isPrConversation = isPRConversation();
	const mergeCommits = await filterMergeCommits(commits.map(commit => getCommitHash(commit)));
	for (const commit of commits) {
		if (!mergeCommits.includes(getCommitHash(commit))) {
			continue;
		}

		commit.classList.add('rgh-merge-commit');
		updateCommitIcon(commit, isPrConversation);
	}
}

async function init(signal) {
	observe(
		[
			'[data-testid="commit-row-item"]',

			'.js-commits-list-item', // `isPRCommitList`
			'.js-timeline-item .TimelineItem:has(.octicon-git-commit)', // `isPRConversation`; "js-timeline-item" excludes "isPRCommitList"
		],
		batchedFunction(markCommits, {delay: 100}),
		{signal},
	);
}

void features.add(import.meta.url, {
	include: [
		isCommitList,
		isPRConversation,
		isCompare,
	],
	requiresToken: true,
	init,
});

/*

Test URLs

- isPRConversation: https://github.com/refined-github/refined-github/pull/9523#commits-pushed-47b8135
- isPRCommitList: https://github.com/refined-github/refined-github/pull/6194/commits
- isCommitList: https://github.com/typed-ember/ember-cli-typescript/commits/master?after=5ff0c078a4274aeccaf83382c0d6b46323f57397+174
- isCompare: https://github.com/refined-github/sandbox/compare/e8b25d3e...b3d0d992

*/

export { getCommitHash };
