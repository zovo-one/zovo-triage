import { isRepo, isNewIssue } from '../npm/ztg-github-url-detection.js';
import features from '../ztg-feature-manager.js';
import { buildRepoUrl } from '../github-helpers/ztg-index.js';
import onAlteredClick from '../helpers/ztg-on-altered-click.js';
import onetime from '../helpers/ztg-onetime.js';
import observe from '../helpers/ztg-selector-observer.js';

// Cache it just like their modal does
// https://github.com/refined-github/refined-github/issues/9641
const {pathname} = location;

function disableLink(link) {
	if (link.getAttribute('href') !== pathname) {
		throw new Error('The template chooser bug might have been fixed');
	}

	link.removeAttribute('href');
}

const newIssueModalDeadLinks = 'div[data-testid="repository-and-template-picker-dialog"] a';
const newIssueMenuItem = 'li[aria-keyshortcuts="n"]:has(.octicon-issue-opened)';

function initDeadLinksOnce() {
	// Explanation: https://github.com/refined-github/refined-github/issues/9615
	observe(newIssueModalDeadLinks, disableLink);
}

function openSearchResultInNewTab(event) {
	event.stopImmediatePropagation();
	event.preventDefault();

	const {href} = event.delegateTarget.dataset;
	if (!href) {
		throw new Error('Expected the search result item to have the `data-href` attribute');
	}

	window.open(href, '_blank');
}

function initSearchResultsOnce() {
	onAlteredClick(
		'li.ActionListItem[data-type="url-result"]',
		openSearchResultInNewTab,
	);
}

function openNewIssuePageInNewTab(event) {
	event.stopImmediatePropagation();
	event.preventDefault();
	window.open(buildRepoUrl('issues/new/choose'), '_blank');
}

function initNewIssueOnce() {
	onAlteredClick(
		[
			// "New issue" menu item in the repo header
			newIssueMenuItem,

			// Main "+" dropdown button
			'button[class*="GlobalCreateMenu-module__actionMenuButton"]',
		],
		openNewIssuePageInNewTab,
	);
}

function initIssueTemplate() {
	onAlteredClick(
		'a[class^="IssueCreatePage-module__chooseTemplateLink"]',
		openNewIssuePageInNewTab,
	);
}

void features.add(import.meta.url, {
	init: onetime(initSearchResultsOnce),
}, {
	include: [
		isRepo,
	],
	init: onetime(initNewIssueOnce),
}, {
	include: [
		isNewIssue,
	],
	init: initIssueTemplate,
}, {
	init: onetime(initDeadLinksOnce),
});

/*

Test URLs:

- https://github.com/refined-github/refined-github
- https://github.com
- https://github.com/refined-github/refined-github/issues/new?template=2_feature_request.yml

*/

export { newIssueMenuItem, newIssueModalDeadLinks };
