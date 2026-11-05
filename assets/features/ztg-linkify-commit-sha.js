import React from '../npm/ztg-dom-chef.js';
import { isPRCommit } from '../npm/ztg-github-url-detection.js';
import { $optional } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import { wrap } from '../helpers/ztg-dom-utils.js';

function init() {
	const element = $optional('.sha.user-select-contain:not(a *)');
	if (element) {
		wrap(element, React.createElement('a', { href: location.pathname.replace(/pull\/\d+\/commits/, 'commit'),} ));
	}
}

void features.add(import.meta.url, {
	include: [
		isPRCommit,
	],
	awaitDomReady: true,
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github/pull/1429/commits/b533ffa5820d825e1730c62d11acb2edbfb2d7dd

*/
