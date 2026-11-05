import { isCompare, isCommitList } from '../npm/ztg-github-url-detection.js';
import { closestElement } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import { isRefinedGitHubRepo } from '../github-helpers/ztg-index.js';
import { commitTitleInLists } from '../github-helpers/ztg-selectors.js';
import observe from '../helpers/ztg-selector-observer.js';

// Source: https://github.com/fregante/release-with-changelog/blob/779fd5e658f82e5b11b1c0a352a6838d3bd8f67f/generate-release-notes.js#L6
const excludePreset = /^bump |^meta|^document|^lint|^refactor|readme|dependencies|^v?\d+\.\d+\.\d+/i;

function dim(commitTitle) {
	if (excludePreset.test(commitTitle.textContent.trim())) {
		closestElement([
			// `isCommitList`
			'[data-testid="commit-row-item"]',
			// `isCompare`
			'.js-commits-list-item',
		], commitTitle).style.opacity = '50%';
	}
}

function init(signal) {
	observe(commitTitleInLists, dim, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		isRefinedGitHubRepo,
	],
	include: [
		isCompare,
		isCommitList,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github/commits/98fb24e53704b436d68f254429885fb7bef09541/source/features/bypass-checks.tsx

*/
