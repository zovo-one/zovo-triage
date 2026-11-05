import { isPR, isIssue, isDiscussion, isRepo } from '../npm/ztg-github-url-detection.js';
import { elementExists } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import { linkifyIssues } from '../github-helpers/ztg-dom-formatters.js';
import { getRepo } from '../github-helpers/ztg-index.js';
import { logError } from '../helpers/ztg-errors.js';
import observe from '../helpers/ztg-selector-observer.js';

function linkifyIssue(paragraph) {
	// Already linkified
	if (elementExists('a', paragraph)) {
		logError(new Error(`${paragraph.textContent} is already linkified`));
	}

	linkifyIssues(getRepo(), paragraph);
}

function init(signal) {
	observe(
		[
			'[data-component="TitleArea"] .markdown-title', // Issue and PR React View Title
			'.js-issue-title', // Discussions and legacy PR Files title
		],
		linkifyIssue,
		{signal},
	);
}

void features.add(import.meta.url, {
	asLongAs: [
		isRepo,
	],
	include: [
		isPR,
		isIssue,
		isDiscussion,
	],
	init,
});

/*

Test URLs

- https://github.com/refined-github/sandbox/issues/108
- https://github.com/refined-github/sandbox/pull/70
- https://github.com/refined-github/sandbox/pull/70/files
- https://github.com/File-New-Project/EarTrumpet/discussions/877

*/
