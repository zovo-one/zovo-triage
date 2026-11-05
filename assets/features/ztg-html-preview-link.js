import React from '../npm/ztg-dom-chef.js';
import { isEnterprise, isSingleFile, isPublicRepo } from '../npm/ztg-github-url-detection.js';
import features from '../ztg-feature-manager.js';
import observe from '../helpers/ztg-selector-observer.js';

const isSingleHtmlFile = () => isSingleFile() && /\.html?$/.test(location.pathname);

function add(rawButton) {
	if (!isPublicRepo()) {
		return;
	}

	rawButton
		.parentElement // `div`
		.parentElement // `BtnGroup`
		.prepend(
			React.createElement('div', { className: rawButton.parentElement.className,}
, React.createElement('a', {
					className: rawButton.className,
					'data-variant': "default",
					'data-size': "small",
					// #3305
					href: `https://refined-github-html-preview.kidonng.workers.dev${rawButton.pathname}`,}
, "Preview"

)
),
		);
}

function init(signal) {
	observe(['a#raw-url', 'a[data-testid="raw-button"]'], add, {signal});
}

void features.add(import.meta.url, {
	include: [
		isSingleHtmlFile,
	],
	exclude: [
		isEnterprise,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/sandbox/blob/html/preview-link/public/test.html
https://github.com/CodingTrain/website/blob/4f90eedb9618257d9166241e92e51a7f3f00a08e/code_challenges/PerlinNoiseTerrain_p5.js/index.html

*/
