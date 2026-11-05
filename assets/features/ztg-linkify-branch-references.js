import React from '../npm/ztg-dom-chef.js';
import { isQuickPR } from '../npm/ztg-github-url-detection.js';
import { $, $$, $optional } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import GitHubFileUrl from '../github-helpers/ztg-github-file-url.js';
import { buildRepoUrl } from '../github-helpers/ztg-index.js';
import observe from '../helpers/ztg-selector-observer.js';

function linkifyQuickPr(element) {
	const branchUrl = buildRepoUrl('tree', element.textContent);
	element.replaceWith(
		React.createElement('span', { className: "commit-ref",}
, React.createElement('a', { className: "no-underline", href: branchUrl, 'data-turbo-frame': "repo-content-turbo-frame",}
, element.textContent
)
),
	);
}

function linkifyHovercard(hovercard) {
	const {href} = $('a.Link--primary', hovercard);

	for (const reference of $$('.commit-ref', hovercard)) {
		const url = new GitHubFileUrl(href).assign({
			route: 'tree',
			branch: reference.title,
		});

		const user = $optional('.user', reference);
		if (user) {
			url.user = user.textContent;
		}

		reference.replaceChildren(
			React.createElement('a', { className: "no-underline", href: url.href, 'data-turbo-frame': "repo-content-turbo-frame",}
, [...reference.childNodes]
),
		);
	}
}

async function quickPrInit(signal) {
	observe('.branch-name', linkifyQuickPr, {signal});
}

function hovercardInit(signal) {
	observe('[data-hydro-view*="pull-request-hovercard-hover"] ~ .d-flex.mt-2', linkifyHovercard, {signal});
}

void features.add(import.meta.url, {
	include: [
		isQuickPR,
	],
	init: quickPrInit,
}, {
	init: hovercardInit,
});

/*

Test URLs:

https://github.com/refined-github/sandbox/compare/default-a...quick-pr-branch?quick_pull=1
https://github.com ("Recent activity" box in left sidebar, hover a PR)

*/
