import delegate from '../npm/ztg-delegate-it-delegate.js';
import { isIssue, isRepoIssueList, isGlobalIssueOrPRList } from '../npm/ztg-github-url-detection.js';
import features from '../ztg-feature-manager.js';

function fix(event) {
	event.stopImmediatePropagation();
	event.delegateTarget.removeAttribute('target');
}

function init(signal) {
	delegate(
		[
			'a[href$="/issues/new/choose"]', // New issue button
			'a[class*="SubIssueTitle"]', // Sub-issue links
			'a[data-testid="issue-pr-title-link"]', // Global issue list links
		],
		'click',
		fix,
		{signal, capture: true},
	);
}

void features.add(import.meta.url, {
	include: [
		isIssue,
		isRepoIssueList,
		isGlobalIssueOrPRList,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/sandbox/issues
https://github.com/refined-github/sandbox/issues/110

*/
