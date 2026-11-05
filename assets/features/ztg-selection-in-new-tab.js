import { $optional, closestElementOptional } from '../npm/ztg-select-dom.js';
import { messageRuntime } from '../npm/ztg-webext-msg.js';
import features from '../ztg-feature-manager.js';
import { registerHotkey } from '../github-helpers/ztg-hotkey.js';
import onetime from '../helpers/ztg-onetime.js';

function openInNewTab() {
	const selected = $optional([
		'.navigation-focus a.js-navigation-open[href]',
		// Old view
		// TODO [2025-07-01]: Drop
		'[data-focus-visible-added] .markdown-title a',
	]);

	if (!selected) {
		return;
	}

	void messageRuntime({
		openUrls: [selected.href],
	});

	// Get the list element that contains the unread class and mark it as read.
	closestElementOptional('.unread', selected)?.classList.replace('unread', 'read');
}

function initOnce() {
	registerHotkey('Shift+O', openInNewTab);
}

void features.add(import.meta.url, {
	shortcuts: {
		'shift o': 'Open selection in new tab',
	},
	init: onetime(initOnce),
});

/*

Test URLs:

https://github.com/notifications
https://github.com/refined-github/refined-github
https://github.com/refined-github/refined-github/issues

*/
