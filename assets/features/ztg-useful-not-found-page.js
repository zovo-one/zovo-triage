import React from '../npm/ztg-dom-chef.js';
import elementReady from '../npm/ztg-element-ready.js';
import { isSingleFile, isRepoTree, is404, isPRCommit404 } from '../npm/ztg-github-url-detection.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { mount } from '../npm/ztg-svelte-internal-client-render.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import features from '../ztg-feature-manager.js';
import { getCleanPathname, isUrlReachable } from '../github-helpers/ztg-index.js';
import onetime from '../helpers/ztg-onetime.js';
import observe from '../helpers/ztg-selector-observer.js';
import Useful_not_found_page from './ztg-useful-not-found-page.svelte.js';
import GitHubFileUrl from '../github-helpers/ztg-github-file-url.js';

function getStrikeThrough(text) {
	return React.createElement('del', { className: "color-fg-subtle",}, text);
}

async function crossIfNonExistent(anchor) {
	if (anchor instanceof HTMLAnchorElement && !await isUrlReachable(anchor.href)) {
		anchor.replaceWith(getStrikeThrough(anchor.textContent));
	}
}

function addWidget(container) {
	mount(Useful_not_found_page, {target: container.parentElement});
}

async function addDirectCommitLinkOnce() {
	const commitUrl = location.origin + '/' + getCleanPathname().replace(/pull\/\d+\/(?:commits|changes)/, 'commit');
	if (!(await isUrlReachable(commitUrl))) {
		return false;
	}

	const commitHash = new GitHubFileUrl(commitUrl).branch.slice(0, 8);
	const blankSlateParagraph = await elementReady('.blankslate:has(> .octicon-telescope) p', {waitForChildren: false});
	blankSlateParagraph.after(
		React.createElement('p', null
, React.createElement('span', { className: "commit-ref",}, React.createElement('a', { href: commitUrl,}, commitHash)), " exists outside of this pull request."
),
	);
}

function crossTreeBreadcrumbs(signal) {
	observe('#repos-header-breadcrumb ol a', crossIfNonExistent, {signal});
}

function init(signal) {
	observe([
		// 410 file
		// Typo in GitHub's code
		'[data-testid="eror-404-description"]',

		// 404 ref
		'[data-testid="error-404-description"]',
	], addWidget, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		is404,
	],
	include: [
		isSingleFile,
		isRepoTree,
	],
	requiresToken: true,
	init,
}, {
	asLongAs: [
		is404,
		isRepoTree,
	],
	// No token required.
	// Only appears on /tree/ URLs:
	// https://github.com/fregante/GhostText/tree/3cacd7df71b097dc525d99c7aa2f54d31b02fcc8/chrome/scripts/InputArea
	init: crossTreeBreadcrumbs,
}, {
	include: [
		isPRCommit404,
	],
	init: onetime(addDirectCommitLinkOnce),
});

/*

Test URLs:

- 404 file: https://github.com/refined-github/refined-github/blob/main/source/features/a-horse-with-no-name.tsx
- 410 file: https://github.com/refined-github/refined-github/blob/main/source/features/highest-rated-comment.tsx
- 301 file: https://github.com/refined-github/refined-github/blob/main/extension/content.js
- 404 folder (native breadcrumbs): https://github.com/fregante/GhostText/tree/3cacd7df71b097dc525d99c7aa2f54d31b02fcc8/chrome/scripts/InputArea
- 404 ref: https://github.com/refined-github/refined-github/blob/eggs-for-branch/package.json
- 410 PR commit: https://github.com/refined-github/refined-github/pull/9773/changes/f3b5e710d3e363dfb1f1211e8807ac4f2366b4b8

*/
