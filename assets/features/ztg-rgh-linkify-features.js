import debounceFunction from '../npm/ztg-debounce-fn.js';
import React from '../npm/ztg-dom-chef.js';
import { isIssue, isPR, hasComments, isReleasesOrTags, isSingleReleaseOrTag, isCommitList, isSingleCommit, isRepoWiki, isRepoTree, isEditingRelease } from '../npm/ztg-github-url-detection.js';
import { closestElementOptional } from '../npm/ztg-select-dom.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { mount } from '../npm/ztg-svelte-internal-client-render.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import { getNewFeatureName } from '../ztg-feature-data.js';
import features from '../ztg-feature-manager.js';
import { isAnyRefinedGitHubRepo } from '../github-helpers/ztg-index.js';
import { commitTitleInLists } from '../github-helpers/ztg-selectors.js';
import { is } from '../helpers/ztg-css-selectors.js';
import { wrap } from '../helpers/ztg-dom-utils.js';
import Related_issues_count from '../components/ztg-related-issues-count.svelte.js';
import { getFeatureUrl } from '../helpers/ztg-rgh-links.js';
import observe from '../helpers/ztg-selector-observer.js';

const shouldShowCount = debounceFunction(() => isIssue() || isPR(), {
	wait: 100,
	before: true,
	after: false,
});

function linkifyFeature(possibleFeature) {
	const originalText = possibleFeature.textContent;
	const id = getNewFeatureName(originalText);
	if (!id) {
		return;
	}

	const href = getFeatureUrl(id);
	// If the original text is different from the resolved ID, it's an old name
	const isOldName = originalText !== id;
	const title = isOldName ? `Now called ${id}` : undefined;
	let anchorElement;

	const possibleLink = possibleFeature.firstElementChild ?? possibleFeature;
	if (possibleLink instanceof HTMLAnchorElement) {
		// Possible DOM structure:
		// - <a>
		// - <code> > <a>
		possibleLink.href = href;
		possibleLink.title = '';
		possibleLink.classList.add('color-fg-accent');
		if (title) {
			possibleLink.title = title;
		}

		// <sup> goes after the <code> element (outside the inner link)
		anchorElement = possibleFeature;
	} else if (!closestElementOptional('a', possibleFeature)) {
		// Possible DOM structure:
		// - <code>
		wrap(
			possibleFeature,
			React.createElement('a', {
				className: "color-fg-accent",
				'data-turbo-frame': "repo-content-turbo-frame",
				href: href,
				title: title,}
			),
		);
		// After wrap(), possibleFeature.parentElement is the new <a>
		// Mount after the <a> so <sup> is outside the link
		anchorElement = possibleFeature.parentElement;
	}

	if (anchorElement && shouldShowCount()) {
		const sup = React.createElement('sup', null );
		anchorElement.after(sup);
		mount(Related_issues_count, {
			target: sup,
			props: {
				featureId: id,
				mini: true,
			},
		});
	}
}

function init(signal) {
	observe(
		[
			'.js-issue-title code', // `isPRConversation`, Old view `isIssue`
			'h1[class^="prc-PageHeader-Title"] code', // `isPRFiles`,
			'[data-testid="issue-title"] code', // `isIssue`
			'.js-comment-body code', // Old view `hasComments`
			'.markdown-body code', // `hasComments`, `isReleasesOrTags`
			'[class^="CommitHeader-module__commitMessageContainer"] code', // `isSingleCommit`,
			`${is(commitTitleInLists)} code`, // `isCommitList`, `isCompare`
			'.react-directory-commit-message code', // `isRepoTree`
		],
		linkifyFeature,
		{signal},
	);
}

void features.add(import.meta.url, {
	asLongAs: [
		isAnyRefinedGitHubRepo,
	],
	include: [
		hasComments,
		isReleasesOrTags,
		isSingleReleaseOrTag,
		isCommitList,
		isSingleCommit,
		isRepoWiki,
		isPR,
		isIssue,
		isRepoTree,
		isEditingRelease,
	],
	init,
});

/*

Test URLs

- hasComments: https://github.com/refined-github/refined-github/issues/8867
- isReleasesOrTags: https://github.com/refined-github/refined-github/releases
- isSingleReleaseOrTag: https://github.com/refined-github/refined-github/releases/tag/23.7.25
- isCommitList: https://github.com/refined-github/refined-github/commits/main
- isSingleCommit: https://github.com/refined-github/refined-github/commit/d63e2d97fc4d85f986a120fb49cd8e09f6785b93
- isRepoWiki: https://github.com/refined-github/refined-github/wiki/Extended-feature-descriptions
- isPR: https://github.com/refined-github/refined-github/pull/8904
- isIssue: https://github.com/refined-github/refined-github/issues/8902

*/
