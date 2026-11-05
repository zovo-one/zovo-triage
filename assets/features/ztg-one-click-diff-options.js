import { clsx } from '../npm/ztg-clsx-clsx.js';
import React from '../npm/ztg-dom-chef.js';
import { isPRFile404, isPRFiles, isSingleCommit, isCompare } from '../npm/ztg-github-url-detection.js';
import CheckIcon from '../npm/ztg-octicons-plain-react-components-Check.js';
import features from '../ztg-feature-manager.js';
import { registerHotkey } from '../github-helpers/ztg-hotkey.js';
import observe from '../helpers/ztg-selector-observer.js';
import { withTooltipRef } from '../components/ztg-tooltip.js';

function isHidingWhitespace() {
	return new URL(location.href).searchParams.get('w') === '1';
}

function getAlternateUrl() {
	const url = new URL(location.href);

	if (isHidingWhitespace()) {
		url.searchParams.delete('w');
	} else {
		url.searchParams.set('w', '1');
	}

	return url.href;
}

function addShortcut(signal) {
	registerHotkey('d w', getAlternateUrl(), {signal});
}

function attachButtons(nativeDiffButtons) {
	nativeDiffButtons.parentElement.after(
		React.createElement('a', {
			ref: withTooltipRef({
				label: `${isHidingWhitespace() ? 'Show' : 'Hide'} whitespace changes`,
				shortcut: 'd w',
			}),
			href: getAlternateUrl(),
			'data-hotkey': "d w" ,
			className: clsx('float-right mr-3 tmp-mr-3 btn btn-sm', isHidingWhitespace() && 'color-fg-subtle'),}

, isHidingWhitespace() && React.createElement(CheckIcon, null ), " No Whitespace"
),
	);
}

function init(signal) {
	observe('[action="/users/diffview"]', attachButtons, {signal});
}

const shortcuts = {
	'd w': 'Show/hide whitespaces in diffs',
};

void features.add(import.meta.url, {
	shortcuts,
	include: [
		isPRFiles,
		isSingleCommit,
	],
	exclude: [
		isPRFile404,
	],
	init: addShortcut,
}, {
	shortcuts,
	include: [
		isCompare,
	],
	init,
});

/*
# Test URLs

Shortcut only:
- PR files: https://github.com/refined-github/refined-github/pull/6261/files
- Single commit: https://github.com/rancher/rancher/commit/e82921075436c21120145927d5a66037661fcf4e

Button:
- Compare, in "Files changed" tab: https://github.com/rancher/rancher/compare/v2.6.3...v2.6.6
- Compare, without tab: https://github.com/rancher/rancher/compare/v2.6.5...v2.6.6

*/
