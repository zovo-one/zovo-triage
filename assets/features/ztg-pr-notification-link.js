import { isNotifications, isPRFiles } from '../npm/ztg-github-url-detection.js';
import features from '../ztg-feature-manager.js';
import { getCleanPathname } from '../github-helpers/ztg-index.js';
import { commentBoxHashPr } from '../github-helpers/ztg-selectors.js';
import observe from '../helpers/ztg-selector-observer.js';

function removeLinkToPrFilesTab(link) {
	if (!isPRFiles(link)) {
		return;
	}

	// Owner + name + pull + number
	link.pathname = getCleanPathname(link).split('/').slice(0, 4).join('/');
	link.hash = commentBoxHashPr;
}

function init(signal) {
	observe('[href*="/pull/"][href*=".."]', removeLinkToPrFilesTab, {signal});
}

void features.add(import.meta.url, {
	include: [
		isNotifications,
	],
	init,
});

/*

Test URL:

https://github.com/notifications

*/

export { removeLinkToPrFilesTab };
