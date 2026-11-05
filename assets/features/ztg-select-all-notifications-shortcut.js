import { isNotifications } from '../npm/ztg-github-url-detection.js';
import { $ } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import { registerHotkey } from '../github-helpers/ztg-hotkey.js';

function selectAllNotifications() {
	$('.js-notifications-mark-all-prompt').click();
}

function init(signal) {
	registerHotkey('a', selectAllNotifications, {signal});
}

void features.add(import.meta.url, {
	shortcuts: {
		a: 'Select all notifications',
	},
	include: [
		isNotifications,
	],
	init,
});

/*

Test URLs:

https://github.com/notifications (Grouped by date)
https://github.com/notifications (Grouped by repo)

*/
