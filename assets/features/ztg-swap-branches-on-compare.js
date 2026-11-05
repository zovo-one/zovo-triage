import React from '../npm/ztg-dom-chef.js';
import { isCompare } from '../npm/ztg-github-url-detection.js';
import { $ } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import { getRepo, buildRepoUrl } from '../github-helpers/ztg-index.js';

const isTwoDotDiff = () =>
	!location.pathname.includes('...')
	&& location.pathname.includes('..');

function init() {
	const {path} = getRepo();

	// `main...main` comparison
	if (path === 'compare') {
		return;
	}

	const references = path
		.replace('compare/', '')
		.split('...')
		.toReversed();

	// Compares against the "base" branch if the URL only has one reference
	if (references.length === 1) {
		references.unshift($('.branch span').textContent);
	}

	if (references[0] === references[1]) {
		return;
	}

	const referencePicker = $('.range-editor .d-inline-block + .range-cross-repo-pair');
	referencePicker.after(
		React.createElement('a', { className: "btn btn-sm mx-2 tmp-mx-2"   , href: buildRepoUrl('compare/' + references.join('...')),}, "Swap"

),
	);
}

void features.add(import.meta.url, {
	include: [
		isCompare,
	],
	exclude: [
		// Disable on Two-dot Git diff comparison #4453
		isTwoDotDiff,
	],
	awaitDomReady: true,
	deduplicate: 'has-rgh',
	init,
});

/*
Test URLs:

- Compare: https://github.com/refined-github/refined-github/compare/23.2.1...main
- Blank but valid: https://github.com/refined-github/refined-github/compare/23.11.15.1433...23.11.15
- Blank but unswappable: https://github.com/refined-github/refined-github/compare
*/
