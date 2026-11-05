import delegate from '../npm/ztg-delegate-it-delegate.js';
import { isPRConversation } from '../npm/ztg-github-url-detection.js';
import { $optional, $ } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import { legacyCommentField } from '../github-helpers/ztg-selectors.js';

/* eslint-disable unicorn/name-replacements -- It's the key name */

function handleKeyDown(event) {
	if (event.key !== 'Enter' || !(event.metaKey || event.ctrlKey)) {
		return;
	}

	const reopenButton = $optional('button[name="comment_and_open"]:disabled');
	if (!reopenButton) {
		return;
	}

	$('.btn-primary[type="submit"]', reopenButton.form).click();
	event.preventDefault();
}

function init(signal) {
	delegate(legacyCommentField, 'keydown', handleKeyDown, {signal});
}

void features.add(import.meta.url, {
	include: [
		isPRConversation,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/sandbox/pull/22

*/
