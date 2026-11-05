import delegate from '../npm/ztg-delegate-it-delegate.js';
import { hasFiles, isGistRevision, isGlobalSearchResults } from '../npm/ztg-github-url-detection.js';
import { $ } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import { codeSearchHeader } from '../github-helpers/ztg-selectors.js';
import { wasInteractiveElementClicked } from './ztg-easy-toggle-commit-messages.js';

function toggleFile(event) {
	if (wasInteractiveElementClicked(event)) {
		return;
	}

	const headerBar = event.delegateTarget;
	$('button:has(> .octicon-chevron-down, > .octicon-chevron-right)', headerBar)
		.dispatchEvent(new MouseEvent('click', {bubbles: true, altKey: event.altKey}));
}

function toggleCodeSearchFile(event) {
	const elementClicked = event.target ;
	const headerBar = event.delegateTarget;
	const toggle = $(':scope > button', headerBar);

	// The clicked element is either the bar itself or one of its children excluding the button
	if (elementClicked === headerBar || (elementClicked !== toggle && elementClicked.parentElement === headerBar)) {
		toggle.dispatchEvent(new MouseEvent('click', {bubbles: true, altKey: event.altKey}));
	}
}

function init(signal) {
	delegate(
		[
			'.file-header',
			// React
			'[class^="Diff-module__diffHeaderWrapper"]',
		],
		'click',
		toggleFile,
		{signal},
	);
}

function initSearchPage(signal) {
	delegate(codeSearchHeader, 'click', toggleCodeSearchFile, {signal});
}

void features.add(import.meta.url, {
	include: [
		hasFiles,
		isGistRevision,
	],
	init,
}, {
	include: [
		isGlobalSearchResults,
	],
	init: initSearchPage,
});

/*

## Test URLs

- Pull Request: https://github.com/refined-github/refined-github/pull/7036/files
- Code Search: https://github.com/search?q=repo%3Arefined-github%2Frefined-github%20easy&type=code

*/
