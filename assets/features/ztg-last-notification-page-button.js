import React from '../npm/ztg-dom-chef.js';
import { isNotifications } from '../npm/ztg-github-url-detection.js';
import { $ } from '../npm/ztg-select-dom.js';
import { stringToBase64 } from '../npm/ztg-uint8array-extras.js';
import features from '../ztg-feature-manager.js';
import { assertNodeContent } from '../helpers/ztg-dom-utils.js';
import looseParseInt from '../helpers/ztg-loose-parse-int.js';
import observe from '../helpers/ztg-selector-observer.js';

const itemsPerNotificationsPage = 25;

function linkify(nextButton) {
	const totalNotificationsNode = $('.js-notifications-list-paginator-counts').lastChild;
	assertNodeContent(totalNotificationsNode, /^of \d+$/);
	const totalNotificationsNumber = looseParseInt(totalNotificationsNode);
	const lastCursor = Math.floor((totalNotificationsNumber - 1) / itemsPerNotificationsPage) * itemsPerNotificationsPage;
	const nextButtonSearch = new URLSearchParams(nextButton.search);
	nextButtonSearch.set('after', stringToBase64(`cursor:${lastCursor}`));
	totalNotificationsNode.replaceWith(
		' of ',
		React.createElement('a', { href: '?' + String(nextButtonSearch),}
, totalNotificationsNumber
),
	);
}

function init(signal) {
	// When there's no "next page", this element becomes `<button disabled>`
	observe('a[aria-label="Next"]', linkify, {signal});
}

void features.add(import.meta.url, {
	include: [
		isNotifications,
	],
	init,
});

/*

Test URLs:

https://github.com/notifications

*/
