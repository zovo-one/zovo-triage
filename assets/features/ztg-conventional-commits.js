import { isCommitList } from '../npm/ztg-github-url-detection.js';
import React from '../npm/ztg-dom-chef.js';
import features from '../ztg-feature-manager.js';
import { commitTitleInLists } from '../github-helpers/ztg-selectors.js';
import { parseConventionalCommit, conventionalCommitRegex } from '../helpers/ztg-conventional-commits.js';
import { is } from '../helpers/ztg-css-selectors.js';
import { removeTextInTextNode } from '../helpers/ztg-dom-utils.js';
import observe from '../helpers/ztg-selector-observer.js';

/*

This feature is documented at https://github.com/refined-github/refined-github/wiki/Customization#conventional-commits

*/


function renderLabelInCommitTitle(commitTitleElement) {
	const textNode = commitTitleElement.firstChild;
	const commit = parseConventionalCommit(textNode.textContent);

	if (!commit) {
		return;
	}

	if (
		// Skip commits that are _only_ "ci:" without anything else. Rare but it would be confusing to show just the label
		commit.raw === textNode.textContent
		&& !commitTitleElement.nextElementSibling

		// Ensure that the element contains only plain text, not stuff like <code>
		&& commitTitleElement.childElementCount < 1
	) {
		return;
	}

	commitTitleElement.prepend(
		React.createElement('span', { className: "IssueLabel hx_IssueLabel mr-2 tmp-mr-2"   , 'rgh-conventional-commits': commit.rawType.toLowerCase(),}
, commit.type
),

		// Keep scope outside because that's how they're rendered in release notes as well
		commit.scope ? React.createElement('span', { className: "color-fg-muted",}, commit.scope) : '',
	);

	removeTextInTextNode(textNode, conventionalCommitRegex);
}

function init(signal) {
	observe(`${is(commitTitleInLists)} > span > a:first-child`, renderLabelInCommitTitle, {signal});
}

void features.add(import.meta.url, {
	include: [
		isCommitList,
	],
	init,
});

/*

Test URLs:

- Repo commits: https://github.com/refined-github/sandbox/commits/conventional-commits/
- PR commits: https://github.com/refined-github/sandbox/pull/91/commits
- Real data: https://github.com/conventional-changelog/standard-version/commits
- Capitalized types: https://github.com/HMCL-dev/HMCL/commits/main/
- Repo without conventional commits: https://github.com/refined-github/refined-github/commits

*/
