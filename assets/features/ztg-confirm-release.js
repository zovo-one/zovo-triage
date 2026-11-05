import delegate from '../npm/ztg-delegate-it-delegate.js';
import { isNewRelease } from '../npm/ztg-github-url-detection.js';
import features from '../ztg-feature-manager.js';

function handleSubmit(event) {
	if (confirm('Are you sure you want to publish this release?')) {
		return;
	}

	event.stopImmediatePropagation();
	event.preventDefault();
}

function handleSubmitOnCtrlEnter(event) {
	if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
		handleSubmit(event);
	}
}

function handleSubmitOnEnter(event) {
	if (event.key === 'Enter' && !event.isComposing) {
		handleSubmit(event);
	}
}

function init(signal) {
	delegate('button[publish-release="true"]', 'click', handleSubmit, {signal, capture: true});
	delegate('textarea#release_body', 'keydown', handleSubmitOnCtrlEnter, {signal, capture: true});
	delegate('input#release_name', 'keydown', handleSubmitOnEnter, {signal, capture: true});
}

void features.add(import.meta.url, {
	include: [
		isNewRelease,
	],
	init,
});

/*

Test URLs:

isNewRelease: https://github.com/refined-github/sandbox/releases/new

*/
