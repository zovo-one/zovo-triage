import React from '../npm/ztg-dom-chef.js';
import { $ } from '../npm/ztg-select-dom.js';
import batchedFunction from '../npm/ztg-batched-function.js';
import { isRepoCommitList } from '../npm/ztg-github-url-detection.js';
import TagIcon from '../npm/ztg-octicons-plain-react-components-Tag.js';
import features from '../ztg-feature-manager.js';
import api from '../github-helpers/ztg-api.js';
import { buildRepoUrl } from '../github-helpers/ztg-index.js';
import observe from '../helpers/ztg-selector-observer.js';
import joinJsx from '../helpers/ztg-join-jsx.js';
import { getCommitHash } from './ztg-mark-merge-commits-in-list.js';
import GetTagsOnCommit from './ztg-tags-on-commits-list.gql.js';
import { commitTitleInLists } from '../github-helpers/ztg-selectors.js';

async function getTags(lastCommit, after, tags = {}) {
	const {repository} = await api.v4(GetTagsOnCommit, {
		variables: {
			commit: lastCommit,
			...after && {after},
		},
	});
	const {nodes} = repository.refs;

	for (const node of nodes) {
		const commit = node.target.commitResourcePath.split('/', 5)[4];
		if (node.name !== 'nightly') {
			tags[commit] ??= new Set();
			tags[commit].add(node.name);
		}
	}

	if (nodes.length === 0 || !repository.refs.pageInfo.hasNextPage) {
		return tags;
	}

	const lastTag = nodes.at(-1).target;
	const lastCommitDate = new Date(repository.object.committedDate);
	const lastTagDate = new Date('tagger' in lastTag ? lastTag.tagger.date : lastTag.committedDate);

	// If the last tag is newer than last commit on the page, then not all commits are accounted for, keep looking
	if (lastCommitDate >= lastTagDate) {
		return tags;
	}

	// eslint-disable-next-line unicorn/no-useless-recursion -- Not much better
	return getTags(lastCommit, repository.refs.pageInfo.endCursor, tags);
}

function renderTags(commit, tags) {
	const tagLinks = [...tags].map(tag =>
		// .markdown-title enables the background color
		React.createElement('a', {
			className: "Link--muted markdown-title" ,
			href: buildRepoUrl('releases/tag', tag),}

, React.createElement('code', null, tag)
),
	);

	$([
		'div[data-testid="list-view-item-description"]',
		'[class^="Description-module__container"]',
	], commit).append(
		React.createElement('div', { className: "ml-1 tmp-ml-1 d-flex flex-items-center gap-1"    ,}
, React.createElement(TagIcon, null )
, React.createElement('span', { className: "d-flex flex-wrap gap-1"  ,}
, joinJsx(' ', tagLinks)
)
),
	);

	$(commitTitleInLists, commit).prepend(React.createElement(TagIcon, { className: "mr-2 tmp-mr-2" ,} ));
	commit.classList.add('rgh-tagged');
}

async function markTags(commits) {
	const tags = await getTags(getCommitHash(commits.at(-1)));

	for (const commit of commits) {
		const commitTags = tags[getCommitHash(commit)];
		// `commitTags` can be undefined if a commit has no associated release tags in the GraphQL response
		if (commitTags?.size) {
			renderTags(commit, commitTags);
		}
	}
}

async function init(signal) {
	observe(
		'[data-testid="commit-row-item"]',
		batchedFunction(markTags, {delay: 100}),
		{signal},
	);
}

void features.add(import.meta.url, {
	include: [
		isRepoCommitList,
	],
	requiresToken: true,
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github/commits/19.5.21.1921

*/
