import { isEnterprise } from '../npm/ztg-github-url-detection.js';
import features from '../ztg-feature-manager.js';
import { registerHotkey } from '../github-helpers/ztg-hotkey.js';
import { getLoggedInUser } from '../github-helpers/ztg-index.js';
import onetime from '../helpers/ztg-onetime.js';

function initOnce() {
	// This patterns also works on gist.github.com
	const origin = isEnterprise() ? location.origin : 'https://github.com';
	const profileLink = new URL(getLoggedInUser(), origin);
	registerHotkey('g m', profileLink.href);
}

void features.add(import.meta.url, {
	shortcuts: {
		'g m': 'Go to Profile',
	},
	init: onetime(initOnce),
});

/*

Test URLs:

1. Visit any page

*/
