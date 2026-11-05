import delegate from '../npm/ztg-delegate-it-delegate.js';
import { isCompare } from '../npm/ztg-github-url-detection.js';
import features from '../ztg-feature-manager.js';

let previousSubmission = 0;

function preventSubmit(event) {
	if (Date.now() - previousSubmission < 1000) {
		event.preventDefault();
	}

	previousSubmission = Date.now();
}

function init(signal) {
	delegate('#new_pull_request', 'submit', preventSubmit, {signal});
}

void features.add(import.meta.url, {
	include: [
		isCompare,
	],
	init,
});

/*

Test URLs:

1. Visit https://github.com/refined-github/sandbox/compare/default-a...7416?expand=1
2. Double-click "Create pull request"

*/
