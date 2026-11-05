import delegate from '../npm/ztg-delegate-it-delegate.js';
import React from '../npm/ztg-dom-chef.js';
import { isSingleReleaseOrTag } from '../npm/ztg-github-url-detection.js';
import { elementExists, $ } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import api from '../github-helpers/ztg-api.js';
import { getRepo } from '../github-helpers/ztg-index.js';
import showToast from '../github-helpers/ztg-toast.js';
import observe from '../helpers/ztg-selector-observer.js';

const getReleaseEditLinkSelector = () => `a[href^="/${getRepo().nameWithOwner}/releases/edit"]` ;

async function convertToDraft() {
	const tagName = location.pathname.split('/').pop();
	const release = await api.v3(`releases/tags/${tagName}`);
	await api.v3(release.url, {
		method: 'PATCH',
		body: {
			draft: true,
		},
	});

	$(getReleaseEditLinkSelector()).click(); // Visit "Edit release" page
}

const confirmMessage = 'The release will be effectively deleted and a new draft will be created.';
const confirmMessageWithReactions = 'Existing user reactions will be lost.';
const confirmMessageQuestion = 'Continue?';

async function onConvertClick() {
	const message = elementExists('.js-reaction-group-button')
		? [confirmMessage, confirmMessageWithReactions, confirmMessageQuestion]
		: [confirmMessage, confirmMessageQuestion];
	if (!confirm(message.join(' '))) {
		return;
	}

	await showToast(convertToDraft(), {
		message: 'Converting…',
		doneMessage: 'Redirecting…',
	});
}

function attachButton(editButton) {
	if (elementExists('[title="Draft"]')) {
		return;
	}

	editButton.before(
		React.createElement('button', {
			type: "button",
			className: "Button Button--secondary Button--small ml-3 tmp-ml-3 mr-1 tmp-mr-1 rgh-convert-draft"       ,}
, "Convert to draft"

),
	);
}

async function init(signal) {
	observe(getReleaseEditLinkSelector(), attachButton, {signal});
	delegate('.rgh-convert-draft', 'click', onConvertClick, {signal});
}

void features.add(import.meta.url, {
	include: [
		isSingleReleaseOrTag,
	],
	requiresToken: true,
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github/releases/tag/23.7.25

*/
