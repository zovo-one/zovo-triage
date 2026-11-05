import React from '../npm/ztg-dom-chef.js';
import { isRepoRoot, isRepoTree, isSingleFile } from '../npm/ztg-github-url-detection.js';
import memoize from '../npm/ztg-memoize.js';
import ChevronLeftIcon from '../npm/ztg-octicons-plain-react-components-ChevronLeft.js';
import { $optional } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import getDefaultBranch from '../github-helpers/ztg-get-default-branch.js';
import GitHubFileUrl from '../github-helpers/ztg-github-file-url.js';
import { groupButtons } from '../github-helpers/ztg-group-buttons.js';
import { isRepoCommitListRoot, fixFileHeaderOverlap } from '../github-helpers/ztg-index.js';
import isDefaultBranch from '../github-helpers/ztg-is-default-branch.js';
import { branchSelector } from '../github-helpers/ztg-selectors.js';
import observe from '../helpers/ztg-selector-observer.js';
import { withTooltipRef } from '../components/ztg-tooltip.js';

const getUrl = memoize(async (currentUrl) => {
	const defaultUrl = new GitHubFileUrl(currentUrl);
	if (isRepoRoot()) {
		// The default branch of the root directory is just /user/repo/
		defaultUrl.route = '';
		defaultUrl.branch = '';
	} else {
		defaultUrl.branch = await getDefaultBranch();
	}

	return defaultUrl.href;
});

async function updateUrl({currentTarget: link}) {
	link.href = await getUrl(location.href);
}

function wrapButtons(buttons) {
	groupButtons(buttons, 'd-flex', 'rgh-default-branch-button-group');

	// `rounded-left-0` is for Firefox
	// https://github.com/refined-github/refined-github/pull/8030
	buttons.at(-1).classList.add('rounded-left-0');
}

async function add(branchSelectorElement) {
	// The DOM varies between details-based DOM and React-based one
	const selectorWrapper = branchSelectorElement.tagName === 'SUMMARY'
		? branchSelectorElement.parentElement
		: branchSelectorElement;
	selectorWrapper.classList.add('rgh-highlight-non-default-branch');

	const existingLink = $optional('.rgh-default-branch-button', branchSelectorElement.parentElement);

	// React issues. Duplicates appear after a color scheme update
	// https://github.com/refined-github/refined-github/issues/7098
	if (existingLink) {
		// Border radius style is removed by the color scheme update
		wrapButtons([existingLink, selectorWrapper]);
		return;
	}

	if (isSingleFile()) {
		fixFileHeaderOverlap(branchSelectorElement);
	}

	const defaultLink = (
		React.createElement('a', {
			ref: withTooltipRef({label: 'View on the default branch', direction: 'se'}),
			className: "btn px-2 tmp-px-2 rgh-default-branch-button flex-self-start"    ,
			href: await getUrl(location.href),
			// Update on hover because the URL may change without a DOM refresh
			// https://github.com/refined-github/refined-github/issues/6554
			// Inlined listener because `mouseenter` is too heavy for `delegate`
			onMouseEnter: updateUrl,}




, React.createElement(ChevronLeftIcon, null )
)
	);

	selectorWrapper.before(defaultLink);
	wrapButtons([defaultLink, selectorWrapper]);
}

async function init(signal) {
	observe(branchSelector, add, {signal});
}

void features.add(import.meta.url, {
	include: [
		isRepoTree,
		isSingleFile,
		isRepoCommitListRoot,
	],
	exclude: [
		isDefaultBranch,
	],
	requiresToken: true,
	init,
});

/*

Test URLs:

- isRepoTree https://github.com/refined-github/refined-github/tree/07ecc75
- isSingleFile, 410 Gone from default branch https://github.com/refined-github/refined-github/blob/07ecc75/extension/content.js
- isRepoCommitList: https://github.com/refined-github/refined-github/commits/07ecc75/
- isRepoCommitList (already on default branch): https://github.com/typed-ember/ember-cli-typescript/commits/master
- isRepoCommitListRoot (no branch selector): https://github.com/refined-github/refined-github/commits/07ecc75/extension
- `isRepoHome`, long branch name: https://github.com/refined-github/sandbox/tree/very-very-long-long-long-long-branch-name

*/
