import { isRepoHome } from '../npm/ztg-github-url-detection.js';
import delay from '../helpers/ztg-delay.js';
import features from '../ztg-feature-manager.js';

async function maybeCleanUrl() {
	const parsed = new URL(location.href);
	if (parsed.searchParams.get('tab') !== 'readme-ov-file') {
		return;
	}

	// GitHub has some delayed logic to deal with this internally
	// https://github.com/refined-github/refined-github/issues/9908
	await delay(500);
	parsed.searchParams.delete('tab');
	history.replaceState(history.state, '', parsed.href);
}

function init(signal) {
	void maybeCleanUrl();

	// TODO [2027-01-01]: Only needed to avoid breaking on Safari <26.2 (<2026)
	navigation?.addEventListener('navigatesuccess', maybeCleanUrl, {signal});
}

void features.add(import.meta.url, {
	include: [
		isRepoHome,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github?tab=readme-ov-file

*/
