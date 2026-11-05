import React from '../npm/ztg-dom-chef.js';
import { isRepoIssueList } from '../npm/ztg-github-url-detection.js';
import PinIcon from '../npm/ztg-octicons-plain-react-components-Pin.js';
import { elementExists, $, closestElement } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import { is } from '../helpers/ztg-css-selectors.js';
import observe from '../helpers/ztg-selector-observer.js';
import { issueIcons } from './ztg-select-notifications.js';

function mark(issueLink) {
	// The href attribute in the pinned issue list contains the absolute URL
	if (!elementExists(`[class*='PinnedIssues-module__container'] a[href="${issueLink.href}"]`)) {
		return;
	}

	// Keep the container and its classes, replace just the contents
	const paths = (React.createElement(PinIcon, null )).children;
	const icon = $(is(issueIcons), closestElement('li', issueLink));
	icon.replaceChildren(...paths);
	icon.parentElement.classList.add('rgh-pinned-issue-icon');
}

function init(signal) {
	observe('a[data-testid="issue-pr-title-link"]', mark, {signal});
}

void features.add(import.meta.url, {
	include: [
		isRepoIssueList,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/sandbox/issues?q=title

Only for the screenshot: https://github.com/gulpjs/gulp/issues?q=in%3Atitle%20update%20docs%20for%20sort%3Aupdated-asc

*/
