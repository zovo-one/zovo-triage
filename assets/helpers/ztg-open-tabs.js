import { messageRuntime } from '../npm/ztg-webext-msg.js';
import showToast from '../github-helpers/ztg-toast.js';
import pluralize from './ztg-pluralize.js';

async function openTabs(urls) {
	if (urls.length >= 10 && !confirm(`This will open ${urls.length} new tabs. Continue?`)) {
		return false;
	}

	const response = messageRuntime({
		openUrls: urls,
	});

	await showToast(response, {
		message: 'Opening…',
		doneMessage: pluralize(urls.length, '$$ tab') + ' opened',
	});

	return true;
}

export { openTabs as default };
