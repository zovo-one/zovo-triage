import { isRepoRoot, isRepoTree, isSingleFile } from '../npm/ztg-github-url-detection.js';
import features from '../ztg-feature-manager.js';
import GitHubFileUrl from '../github-helpers/ztg-github-file-url.js';
import { scrollIntoViewIfNeeded } from '../github-helpers/ztg-index.js';
import delay from '../helpers/ztg-delay.js';
import onetime from '../helpers/ztg-onetime.js';

async function init() {
	const {filePath} = new GitHubFileUrl(location.href);

	// eslint-disable-next-line unicorn/prefer-query-selector -- `querySelector` requires escaping
	const item = document.getElementById(`${filePath}-item`);
	if (item) {
		// This feature is only needed for the very first load of the view.
		// GitHub does it natively after that.
		scrollIntoViewIfNeeded(item);

		// Try again after a delay because GitHub might have reset the scroll
		// https://github.com/refined-github/refined-github/pull/7848#discussion_r1784041198
		await delay(500);
		scrollIntoViewIfNeeded(item);
	} else {
		// The sidebar might be closed
		return false;
	}
}

void features.add(import.meta.url, {
	asLongAs: [
		// Not my problem https://github.com/refined-github/refined-github/issues/9981
		onetime(() => 'scrollIntoViewIfNeeded' in document.createElement('i')),
	],
	include: [
		isRepoTree,
		isSingleFile,
	],
	exclude: [
		isRepoRoot,
	],
	awaitDomReady: true,
	init,
});

/*

Test URLs:

- https://github.com/refined-github/refined-github/blob/main/source/features/mark-private-repos.css
- https://github.com/refined-github/refined-github/tree/main/test/web-ext-profile

*/
