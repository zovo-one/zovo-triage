import { is404, isRepoTree } from '../npm/ztg-github-url-detection.js';
import features from '../ztg-feature-manager.js';
import { createHeatIndexFunction } from '../helpers/ztg-math.js';
import observe from '../helpers/ztg-selector-observer.js';

/*

This feature is documented at https://github.com/refined-github/refined-github/wiki/Customization

*/


const calculateHeatIndex = createHeatIndexFunction([0, -2e9]);
const month = 30 * 24 * 60 * 60 * 1000;

function addHeatIndex(lastUpdateElement) {
	// `datetime` attribute used by pre-React version
	const lastUpdate = new Date(lastUpdateElement.getAttribute('datetime') ?? lastUpdateElement.title);
	const diff = Date.now() - lastUpdate.getTime();

	// Dim files older than 4 months; dimmer after 12
	if (diff > 4 * month) {
		lastUpdateElement.style.opacity = diff > 12 * month ? '0.6' : '0.8';
		return;
	}

	lastUpdateElement.setAttribute('data-rgh-heat', String(calculateHeatIndex(-diff)));
}

function init(signal) {
	observe('.react-directory-commit-age > [title]', addHeatIndex, {signal});
}

void features.add(import.meta.url, {
	include: [
		isRepoTree,
	],
	exclude: [
		is404,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github
https://github.com/refined-github/refined-github/tree/main/source

*/
