import React from '../npm/ztg-dom-chef.js';
import { isRepo } from '../npm/ztg-github-url-detection.js';
import features from '../ztg-feature-manager.js';
import { buildRepoUrl } from '../github-helpers/ztg-index.js';
import observe from '../helpers/ztg-selector-observer.js';

function addLinkToBanner(banner) {
	if (banner.lastChild.textContent.includes('repository has been archived')) {
		banner.lastChild.after(
			' You can check out ',
			React.createElement('a', { href: buildRepoUrl('forks'),}, "its forks" ),
			'.',
		);
	}
}

function init(signal) {
	observe('#js-repo-pjax-container > .flash-warn:first-of-type', addLinkToBanner, {signal});
}

void features.add(import.meta.url, {
	include: [
		isRepo,
	],
	init,
});

/*
Test URLs:

https://github.com/probot/template/blob/master/CODE_OF_CONDUCT.md?rgh-link-date=2022-10-12T08%3A11%3A41Z
*/
