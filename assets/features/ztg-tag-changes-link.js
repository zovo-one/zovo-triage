import { clsx } from '../npm/ztg-clsx-clsx.js';
import React from '../npm/ztg-dom-chef.js';
import domLoaded from '../npm/ztg-dom-loaded.js';
import { isEmptyRepoRoot, isReleasesOrTags, isSingleReleaseOrTag, isEnterprise, isTags, isReleases } from '../npm/ztg-github-url-detection.js';
import DiffIcon from '../npm/ztg-octicons-plain-react-components-Diff.js';
import { $$, elementExists, $optional, $ } from '../npm/ztg-select-dom.js';
import compareVersions from '../npm/ztg-tiny-version-compare.js';
import features from '../ztg-feature-manager.js';
import { buildRepoUrl, getRepo, parseTag } from '../github-helpers/ztg-index.js';
import fetchDom from '../helpers/ztg-fetch-dom.js';
import { withTooltipRef } from '../components/ztg-tooltip.js';

async function getNextPage() {
	const nextPageLink = $optional('.pagination a:last-child');
	if (nextPageLink) {
		return fetchDom(nextPageLink.href);
	}

	if (isSingleReleaseOrTag()) {
		const [, tag = ''] = getRepo().path.split('releases/tag/', 2); // Already URL-encoded
		return fetchDom(buildRepoUrl(`tags?after=${tag}`));
	}

	return new DocumentFragment();
}

function parseTags(element) {
	// DO NOT change this to `pathname` because it's empty when element is from `getNextPage` function
	// https://github.com/refined-github/refined-github/pull/7726#discussion_r1727135015
	const tagUrl = $(['a[href*="/tree/"]', 'a[href*="/tag/"]'], element).href;
	const {tag} = /\/(?:releases\/tag|tree)\/(?<tag>.*)/.exec(tagUrl).groups;

	return {
		element,
		tag,
		commit: $('[href*="/commit/"]', element).textContent.trim(),
		...parseTag(decodeURIComponent(tag)), // `version`, `namespace`
	};
}

function getPreviousTag(current, allTags) {
	let unmatchedNamespaceTag;

	for (let next = current + 1; next < allTags.length; next++) {
		// Find a version on a different commit, if there are multiple tags on the same one
		if (allTags[next].commit === allTags[current].commit) {
			continue;
		}

		// Find an earlier version
		if (compareVersions(allTags[current].version, allTags[next].version) < 1) {
			continue;
		}

		if (allTags[current].namespace === allTags[next].namespace) {
			return allTags[next].tag;
		}

		// If no matching namespace is found, just use the next one
		unmatchedNamespaceTag ??= allTags[next].tag;
	}

	return unmatchedNamespaceTag;
}

async function init() {
	document.documentElement.classList.add('rgh-tag-changes-link');

	const tagsSelector = [
		// https://github.com/facebook/react/releases (release in releases list)
		'.repository-content .col-md-2',

		// https://github.com/facebook/react/tags (tags list)
		'.Box-row .commit',

		// https://github.com/facebook/react/releases/tag/v17.0.2 (single release page)
		'.Box-body .border-md-bottom',
	];

	await domLoaded;
	// Look for tags in the current page and the next page
	const pages = [document, await getNextPage()];
	const allTags = $$(tagsSelector, pages).map(tag => parseTags(tag));

	for (const [index, container] of allTags.entries()) {
		const previousTag = getPreviousTag(index, allTags);
		if (!previousTag) {
			continue;
		}

		const lastLinks = $$([
			'.Link--muted[data-hovercard-type="commit"]', // Link to commit in release sidebar
			'.list-style-none > .d-inline-block:last-child', // Link to source tarball under release tag
		], container.element);
		for (const lastLink of lastLinks) {
			const currentTag = allTags[index].tag;
			const compareLink = (
				React.createElement('a', {
					ref: withTooltipRef({
						label: `See commits between ${decodeURIComponent(previousTag)} and ${decodeURIComponent(currentTag)}`,
						direction: 'n',
					}),
					className: "Link--muted",
					href: buildRepoUrl(`compare/${previousTag}...${currentTag}`),}

, React.createElement(DiffIcon, null ), " " , isEnterprise() ? 'Commits' : React.createElement('span', { className: "ml-1 tmp-ml-1 wb-break-all"  ,}, "Commits")
)
			);

			// The page of a tag without a release still uses the old layout #5037
			if (
				isEnterprise()
				|| isTags()
				|| (isSingleReleaseOrTag() && elementExists('.release'))
			) {
				lastLink.after(
					React.createElement('li', { className: clsx(lastLink.className, 'rgh-changelog-link'),}
, compareLink
),
				);
				// Fix spacing issue when the window is < 700px wide https://github.com/refined-github/refined-github/pull/3841#issuecomment-754325056
				lastLink.classList.remove('flex-auto');
				continue;
			}

			lastLink.parentElement.after(
				React.createElement('div', {
					className: clsx(
						'rgh-changelog-link mr-4 tmp-mr-3',
						isReleases()
							? 'tmp-my-md-2 my-md-2 mr-md-0 tmp-mr-md-0'
							: 'mb-2 tmp-mb-2',
					),}

, compareLink
),
			);
			if (isReleases()) {
				lastLink.classList.remove('mb-2');
				lastLink.parentElement.classList.remove('mb-md-2');
			}
		}
	}
}

void features.add(import.meta.url, {
	include: [
		isReleasesOrTags,
		isSingleReleaseOrTag,
	],
	exclude: [
		isEmptyRepoRoot,
	],
	deduplicate: 'has-rgh-inner',
	init,
});

/*

Test URLs:

- https://github.com/refined-github/refined-github/releases
- https://github.com/refined-github/refined-github/tags
- https://github.com/refined-github/refined-github/releases/tag/23.2.5

*/
