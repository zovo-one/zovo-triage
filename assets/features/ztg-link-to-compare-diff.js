import React from '../npm/ztg-dom-chef.js';
import { isCompare } from '../npm/ztg-github-url-detection.js';
import { elementExists } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import { wrapAll } from '../helpers/ztg-dom-utils.js';
import observe from '../helpers/ztg-selector-observer.js';

function linkify(changedFilesSummary) {
	wrapAll(
		React.createElement('a', { className: "no-underline rgh-link-to-compare-diff" , href: "#files_bucket",} ),
		...changedFilesSummary.children,
	);
}

function init(signal) {
	observe('.Box li:has(> .octicon-file-diff)', linkify, {signal});
}

void features.add(import.meta.url, {
	include: [
		isCompare,
	],
	exclude: [
		() => elementExists('.tabnav:not(.CommentBox-header)'), // The commit list and compare diff are in two separate tabs
	],
	awaitDomReady: true, // DOM-based exclusion filter
	init,
});

/*

Test URLs:

Separate tabs: https://github.com/refined-github/sandbox/compare/buncha-files...default-a
One view: https://github.com/refined-github/sandbox/compare/default-a...buncha-files

*/
