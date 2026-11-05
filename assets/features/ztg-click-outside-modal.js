import delegate from '../npm/ztg-delegate-it-delegate.js';
import { isBranches, isRepoCommitList, isRepoTree, isSingleFile } from '../npm/ztg-github-url-detection.js';
import features from '../ztg-feature-manager.js';

function onButtonClick({delegateTarget, target}) {
	// Only close if clicking outside of modal
	if (delegateTarget === target) {
		delegateTarget.dispatchEvent(new KeyboardEvent('keydown', {bubbles: true, key: 'Escape', code: 'Escape'}));
	}
}

function init(signal) {
	delegate('[class*="Dialog__Backdrop-"]', 'click', onButtonClick, {signal});
}

void features.add(import.meta.url, {
	include: [
		isBranches,
		isRepoCommitList,
		isRepoTree,
		isSingleFile,
	],
	init,
});

/*

## Test URLs

- https://github.com/refined-github/refined-github
- https://github.com/refined-github/refined-github/branches
- https://github.com/refined-github/refined-github/commits/main/
- https://github.com/refined-github/refined-github/blob/main/package.json

*/
