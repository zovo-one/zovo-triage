import batchedFunction from '../npm/ztg-batched-function.js';
import React from '../npm/ztg-dom-chef.js';
import { isRepoIssueList } from '../npm/ztg-github-url-detection.js';
import '../npm/ztg-webext-storage-cache.js';
import features from '../ztg-feature-manager.js';
import api from '../github-helpers/ztg-api.js';
import { getRepo } from '../github-helpers/ztg-index.js';
import observe from '../helpers/ztg-selector-observer.js';
import CachedFunction from '../npm/ztg-webext-storage-cache-cached-function.js';

const lastUpdatedCache = new CachedFunction('last-updated', {
	async updater(issueNumbers) {
		const {repository} = await api.v4(`
		repository() {
			${
				issueNumbers.map(number => `
					${api.escapeKey(number)}: issue(number: ${number}) {
						updatedAt
					}
				`).join('\n')
			}
		}
	`);

		return repository;
	},
	maxAge: {minutes: 30},
	cacheKey: ([issues]) => `${getRepo().nameWithOwner}:${String(issues)}`,
});

function getPinnedIssueNumber(pinnedIssueMetadata) {
	const {issueNumber} = /#(?<issueNumber>\d+)/.exec(pinnedIssueMetadata.textContent).groups;
	return Number(issueNumber);
}

async function update(pinnedIssuesMetadata) {
	const issuesByNumber = new Map(pinnedIssuesMetadata.map(metadata => [getPinnedIssueNumber(metadata), metadata]));
	const lastUpdated = await lastUpdatedCache.get([...issuesByNumber.keys()]);

	for (const [issueNumber, issueMetadata] of issuesByNumber) {
		const {updatedAt} = lastUpdated[api.escapeKey(issueNumber)];
		issueMetadata.after(
			// .rgh class enables tweakers to hide the number
			React.createElement('span', { className: "text-small color-fg-muted" ,}
, React.createElement('span', { className: "rgh-pinned-issue-number",}, "#", issueNumber), " updated "  , React.createElement('relative-time', { datetime: updatedAt,} )
),
		);

		issueMetadata.hidden = true;
	}
}

async function init(signal) {
	observe('span[class^="PinnedIssue-module__issueMetadata"]', batchedFunction(update, {delay: 100}), {signal});
}

void features.add(import.meta.url, {
	include: [
		isRepoIssueList,
	],
	requiresToken: true,
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github/issues

*/
