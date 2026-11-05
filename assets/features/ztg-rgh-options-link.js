import delegate from '../npm/ztg-delegate-it-delegate.js';
import features from '../ztg-feature-manager.js';
import { isRefinedGitHubRepo } from '../github-helpers/ztg-index.js';
import openOptions from '../helpers/ztg-open-options.js';
import observe from '../helpers/ztg-selector-observer.js';

/* You can have invisible/inactive links to the options page on the wiki. This feature enables them. */
/* Use this HTML in a markdown document: <a name="options-page-link">options page</a> */

const placeholdersSelector = 'a[name="user-content-options-page-link"]';

function linkify(anchor) {
	// This makes the anchor visible and clickable
	anchor.href = '#refined-github-options';
}

function init(signal) {
	observe(placeholdersSelector, linkify, {signal});
	delegate(placeholdersSelector, 'click', openOptions, {signal});
}

void features.add(import.meta.url, {
	include: [
		isRefinedGitHubRepo,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github/wiki

*/
