import React from '../npm/ztg-dom-chef.js';
import { isPRCommit } from '../npm/ztg-github-url-detection.js';
import '../npm/ztg-webext-storage-cache.js';
import features from '../ztg-feature-manager.js';
import api from '../github-helpers/ztg-api.js';
import pluralize from '../helpers/ztg-pluralize.js';
import observe from '../helpers/ztg-selector-observer.js';
import { withTooltipRef } from '../components/ztg-tooltip.js';
import GetCommitChanges from './ztg-pr-commit-lines-changed.gql.js';
import CachedFunction from '../npm/ztg-webext-storage-cache-cached-function.js';

// Adapted from GitHub https://github.com/refined-github/refined-github/pull/9486#discussion_r3252807259
const totalSquares = 5;

function calculateDiffSquareCounts(linesAdded, linesDeleted) {
	const linesChanged = linesAdded + linesDeleted;
	// Adjustment function to give a more accurate representation of the scale of the diff
	const adjust = linesChanged > totalSquares ? totalSquares / linesChanged : 1;

	const green = Math.floor(linesAdded * adjust);
	const red = Math.floor(linesDeleted * adjust);
	const gray = totalSquares - green - red;

	return {green, red, gray};
}

const commitChanges = new CachedFunction('commit-changes', {
	async updater(commit) {
		const {repository} = await api.v4(GetCommitChanges, {
			variables: {
				commit,
			},
		});

		return [repository.object.additions, repository.object.deletions];
	},
});

function repeatItems(count, Item) {
	return Array.from({length: count}, () => React.createElement(Item, { style: {borderRadius: '2px'},} ));
}

async function add(commitHash) {
	const commitSha = location.pathname.split('/').pop();
	const [additions, deletions] = await commitChanges.get(commitSha);
	const tooltip = pluralize(additions + deletions, '1 line changed', '$$ lines changed');
	const {green, red, gray} = calculateDiffSquareCounts(additions, deletions);
	commitHash.prepend(
		React.createElement('span', { ref: withTooltipRef(tooltip), className: "ml-2 tmp-ml-2 d-md-block d-none diffstat"    ,}
, React.createElement('span', { className: "color-fg-success",}, "+", additions)
, ' '
, React.createElement('span', { className: "color-fg-danger",}, "−", deletions)
, ' '
, repeatItems(green, () => React.createElement('span', { className: "diffstat-block-added",} ))
, repeatItems(red, () => React.createElement('span', { className: "diffstat-block-deleted",} ))
, repeatItems(gray, () => React.createElement('span', { className: "diffstat-block-neutral",} ))
),
	);
}

async function init(signal) {
	observe('[class*="__CommitAttributionContainer"] + .text-mono', add, {signal});
}

void features.add(import.meta.url, {
	include: [
		isPRCommit,
	],
	requiresToken: true,
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github/pull/6674/commits/3d93b7823e3c31d3bd1900ab1ec98f5ce41203bf

*/
