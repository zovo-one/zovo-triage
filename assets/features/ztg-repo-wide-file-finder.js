import { isPRFiles, isFileFinder, isRepo } from '../npm/ztg-github-url-detection.js';
import { elementExists } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import getCurrentGitRef from '../github-helpers/ztg-get-current-git-ref.js';
import getDefaultBranch from '../github-helpers/ztg-get-default-branch.js';
import { registerHotkey } from '../github-helpers/ztg-hotkey.js';
import { buildRepoUrl } from '../github-helpers/ztg-index.js';

async function init(signal) {
	const ref = getCurrentGitRef() ?? await getDefaultBranch();
	const url = buildRepoUrl('tree', ref) + '?search=1';
	registerHotkey('t', url, {signal});
}

void features.add(import.meta.url, {
	include: [
		isRepo,
	],
	exclude: [
		// TODO [2026-10-01]: Drop first two selectors
		() => elementExists(['[data-hotkey="t"]', '[data-hotkey="t,Shift+T"]', '[aria-label="Go to file"]']),
		isPRFiles,
		isFileFinder,
	],
	awaitDomReady: true, // DOM-based filters
	requiresToken: true,
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github/actions

*/
