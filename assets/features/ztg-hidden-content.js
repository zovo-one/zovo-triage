import { isPR, isIssue, isPRFiles } from '../npm/ztg-github-url-detection.js';
import { $optional } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import { scrollIntoViewIfNeeded, isMac } from '../github-helpers/ztg-index.js';
import showOverlay from '../helpers/ztg-overlay.js';

function isCtrlF(event) {
	return (
		(isMac ? event.metaKey : event.ctrlKey)
		&& !event.shiftKey
		&& !event.altKey
		&& event.key === 'f'
	);
}

// Don't use `data-hotkey` because it always prevents default
async function scrollOnSearch(event) {
	if (!isCtrlF(event)) {
		return;
	}

	const indicator = $optional(
		// Issues
		'[class*="LoadMore"]',

		// TODO: Add support for PRs by detecting deferred-content wrappers
	);
	if (indicator) {
		const content = isPRFiles() ? 'files' : 'comments';
		scrollIntoViewIfNeeded(indicator);
		await showOverlay(`There are hidden ${content} that won’t be searched`);
	}
}

function init(signal) {
	globalThis.addEventListener('keydown', scrollOnSearch, {signal});
}

void features.add(import.meta.url, {
	include: [
		isPR,
		isIssue,
	],
	init,
});

/*

Test URLs

https://togithub.com/prettier/prettier/issues/7475

*/
