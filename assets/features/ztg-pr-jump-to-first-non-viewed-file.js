import delegate from '../npm/ztg-delegate-it-delegate.js';
import elementReady from '../npm/ztg-element-ready.js';
import { isPRFile404, isPRCommit, isPRFiles } from '../npm/ztg-github-url-detection.js';
import { $optional } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';

function jumpToFirstNonViewed() {
	const firstNonViewedFile = $optional([
		// TODO [2027-01-01]: Old PR Files view, drop
		'[id][data-details-container-group="file"]:not([data-file-user-viewed])',
		'[id][class^="Diff-module"]:has(button[aria-pressed="false"])',
	]);
	if (firstNonViewedFile) {
		// Scroll to file without pushing to history
		location.replace('#' + firstNonViewedFile.id);
	} else {
		// The file hasn't loaded yet, so make GitHub load it by scrolling to the bottom
		window.scrollTo(window.scrollX, document.body.scrollHeight);
	}
}

const selectors = [
	// TODO [2027-01-01]: Old PR Files view, drop
	'.diffbar-item progress-bar',
	'.d-flex:has([class*="ViewedFileProgress"])',
];
async function init(signal) {
	const bar = await elementReady(selectors);
	bar.style.cursor = 'pointer';
	delegate(selectors, 'click', jumpToFirstNonViewed, {signal});
}

void features.add(import.meta.url, {
	include: [
		isPRFiles,
	],
	exclude: [
		isPRFile404,
		isPRCommit,
	],
	init,
});

/*

Test URLs:

PR: https://github.com/refined-github/sandbox/pull/55/files
Large PR https://github.com/pixiebrix/pixiebrix-extension/pull/6808/files

*/
