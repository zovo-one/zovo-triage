import delegate from '../npm/ztg-delegate-it-delegate.js';
import { isPRConversation } from '../npm/ztg-github-url-detection.js';
import { closestElement } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';

function unclipChecks({delegateTarget}) {
	closestElement('section[aria-label="Checks"]', delegateTarget).classList.add('rgh-unclip-checks');
}

function init(signal) {
	delegate(
		'button[aria-label="Expand checks"]',
		'click',
		unclipChecks,
		{signal, capture: true},
	);
}

void features.add(import.meta.url, {
	include: [
		isPRConversation,
	],
	init,
});

/*

Test URLs:

https://togithub.com/facebook/react/pull/34051

*/
