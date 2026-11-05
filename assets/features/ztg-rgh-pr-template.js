import React from '../npm/ztg-dom-chef.js';
import { isCompare } from '../npm/ztg-github-url-detection.js';
import { linkifyUrlsToDom } from '../npm/ztg-linkify-urls.js';
import { closestElement } from '../npm/ztg-select-dom.js';
import shortenRepoUrl from '../npm/ztg-shorten-repo-url.js';
import { replaceFieldText } from '../npm/ztg-text-field-edit.js';
import features from '../ztg-feature-manager.js';
import { isRefinedGitHubRepo } from '../github-helpers/ztg-index.js';
import observe from '../helpers/ztg-selector-observer.js';

function extract(textarea) {
	// eslint-disable-next-line regexp/prefer-named-capture-group -- Verbose
	replaceFieldText(textarea, /<!--(.+)-->\n/s, (_, match) => {
		closestElement('tab-container', textarea).before(
			React.createElement('div', { style: {whiteSpace: 'pre-wrap'}, className: "flash mb-3 tmp-mb-3 p-3 tmp-p-3"    ,}
, linkifyUrlsToDom(match.trim(), {value: url => shortenRepoUrl(url, location.href)})
),
		);

		return '';
	});
}

function init(signal) {
	observe('#pull_request_body', extract, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		isRefinedGitHubRepo,
		isCompare,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github/compare/main...sandbox/keep-branch?quick_pull=1

*/
