import '../npm/ztg-svelte-internal-client-constants.js';
import { mount } from '../npm/ztg-svelte-internal-client-render.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import React from '../npm/ztg-dom-chef.js';
import { $$optional, $ } from '../npm/ztg-select-dom.js';
import '../npm/ztg-webext-storage-cache.js';
import { isPRConversation, isMergedPR, isOpenConversation } from '../npm/ztg-github-url-detection.js';
import features from '../ztg-feature-manager.js';
import waitForPrMerge from '../github-events/ztg-on-pr-merge.js';
import { userHasPushAccess } from '../github-helpers/ztg-get-user-permission.js';
import { getRepo, buildRepoUrl } from '../github-helpers/ztg-index.js';
import fetchDom from '../helpers/ztg-fetch-dom.js';
import observe from '../helpers/ztg-selector-observer.js';
import Closing_remarks from './ztg-closing-remarks.svelte.js';
import Closing_remarks_header_tag from '../components/ztg-closing-remarks-header-tag.svelte.js';
import CachedFunction from '../npm/ztg-webext-storage-cache-cached-function.js';

const firstTag = new CachedFunction('first-tag', {
	async updater(commit) {
		const tagsAndBranches = await fetchDom(buildRepoUrl('branch_commits', commit));
		const tags = $$optional('ul.branches-tag-list a', tagsAndBranches);
		// Prefer versioned tags https://github.com/refined-github/refined-github/issues/7206
		const tag = tags.findLast(({textContent}) =>
			!textContent.includes('nightly') && /\d[.]\d/.test(textContent),
		)

		// But still select any tag if no versioned tags are found
		// https://github.com/refined-github/refined-github/issues/9831
		?? tags.at(-1);

		// No tags might be found at all
		return tag?.textContent ?? false;
	},
	cacheKey: ([commit]) => [getRepo().nameWithOwner, commit].join(':'),
});

function getMergeCommitHash() {
	const mergeCommit = $(`.TimelineItem.js-details-container.Details a[href^="/${getRepo().nameWithOwner}/commit/" i]`);
	return /commit\/(?<hash>[0-9a-f]{40})/.exec(mergeCommit.pathname).groups.hash;
}

function mountClosingRemarks(props, signal) {
	const container = React.createElement('div', null );
	mount(Closing_remarks, {target: container, props});
	observe('.js-discussion', anchor => {
		anchor.after(container);
	}, {signal});
}

async function init(signal) {
	const mergeCommit = getMergeCommitHash();
	const tagName = await firstTag.get(mergeCommit);
	if (!tagName) {
		mountClosingRemarks({mergeCommit}, signal);
		return;
	}

	mountClosingRemarks({tagName, mergeCommit}, signal);
	observe('[class*="PullRequestHeaderSummary"] relative-time', relativeTime => {
		mount(Closing_remarks_header_tag, {target: relativeTime.parentElement, props: {tagName}});
	}, {signal});
}

void features.add(import.meta.url, {
	// When arriving on an already-merged PR
	asLongAs: [
		isPRConversation,
		isMergedPR,
	],
	awaitDomReady: true, // It must look for the merge commit
	init,
}, {
	// This catches a PR while it's being merged
	asLongAs: [
		isPRConversation,
		isOpenConversation,
		userHasPushAccess,
	],
	awaitDomReady: true, // Post-load user event, no need to listen earlier
	async init(signal) {
		await waitForPrMerge(signal);
		mountClosingRemarks({postMerge: true}, signal);
	},
});

/*
Test URLs

- PR: https://github.com/refined-github/refined-github/pull/5600
- Locked PR: https://github.com/eslint/eslint/pull/17
- Archived repo: https://github.com/fregante/iphone-inline-video/pull/130
- Untagged PR: https://github.com/mwmwmwmwmwmwmwmwmwmwmwwwmwmwmwmwmwmwmwm/closing-remarks/pull/3
- Prefer versioned tag: https://github.com/mwmwmwmwmwmwmwmwmwmwmwwwmwmwmwmwmwmwmwm/closing-remarks/pull/1
	- See: https://github.com/mwmwmwmwmwmwmwmwmwmwmwwwmwmwmwmwmwmwmwm/closing-remarks/branch_commits/60eb1e5ee0953c70e6fc6150dbeacd1cf20899be
- Show nightly tag if alone: https://github.com/mwmwmwmwmwmwmwmwmwmwmwwwmwmwmwmwmwmwmwm/closing-remarks/pull/2
	- See https://github.com/mwmwmwmwmwmwmwmwmwmwmwwwmwmwmwmwmwmwmwm/closing-remarks/branch_commits/7571f5312ab5db9c23aa11a7e40c5ec88624a11b

*/
