import { isPR, isIssue } from '../npm/ztg-github-url-detection.js';
import features from '../ztg-feature-manager.js';
import observe from '../helpers/ztg-selector-observer.js';

function underlineSelfReference(link) {
	if (link.href !== location.href) {
		return;
	}

	link.title = 'Link is a self-reference';

	// Disable link and hovercard
	link.removeAttribute('href');
	link.removeAttribute('data-hovercard-url');

	// TODO [2027-01-01]: Use shorthand `text-decoration` property (due to Safari 18)
	link.style.textDecorationLine = 'underline';
	link.style.textDecorationStyle = 'wavy';
	link.style.textDecorationColor = 'red';
}

function init(signal) {
	// Exclude reference to a comment on the same page
	observe('.markdown-body:not(section[aria-label="Events"] *) a.issue-link:not([href*="#"])', underlineSelfReference, {
		signal,
	});
}

void features.add(import.meta.url, {
	include: [
		isPR,
		isIssue,
	],
	init,
});

/*

## Test URLs

https://github.com/refined-github/sandbox/pull/120
https://github.com/refined-github/sandbox/issues/122

*/
