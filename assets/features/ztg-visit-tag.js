import { isRepoTree, isSingleFile, isReleasesOrTags, isSingleReleaseOrTag } from '../npm/ztg-github-url-detection.js';
import ArrowUpRightIcon from '../npm/ztg-octicons-plain-react-components-ArrowUpRight.js';
import CodeIcon from '../npm/ztg-octicons-plain-react-components-Code.js';
import React from '../npm/ztg-dom-chef.js';
import { elementExists } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import { buildRepoUrl } from '../github-helpers/ztg-index.js';
import { branchSelector } from '../github-helpers/ztg-selectors.js';
import { is } from '../helpers/ztg-css-selectors.js';
import { wrapAll } from '../helpers/ztg-dom-utils.js';
import observe from '../helpers/ztg-selector-observer.js';

async function addLink(branchSelectorElement) {
	if (
		elementExists([
			// If the branch picker is open, do nothing #7491
			'#selectPanel',

			// React view deduplication https://github.com/refined-github/refined-github/issues/7601
			'.rgh-visit-tag',
		])
	) {
		return;
	}

	// Uses optional chaining to emit a better error manually
	const tag = branchSelectorElement.getAttribute('aria-label')?.replace(/ tag$/, '');
	if (!tag) {
		throw new Error('Tag not found in DOM. The feature needs to be updated');
	}

	wrapAll(
		React.createElement('div', { className: "d-flex gap-2" ,} ),
		branchSelectorElement,
		React.createElement('a', {
			className: "btn px-2 tmp-px-2 tooltipped tooltipped-se rgh-visit-tag"     ,
			href: buildRepoUrl('releases/tag', tag),
			'aria-label': "Visit tag" ,}

, React.createElement(ArrowUpRightIcon, null )
),
	);
}

function replaceIcon(tagIcon) {
	// https://github.com/refined-github/refined-github/issues/6499#issuecomment-1505256426
	tagIcon.replaceWith(React.createElement(CodeIcon, null ));
}

function clarifyIcon(signal) {
	observe('.Link[href*="/tree/"] svg.octicon-tag', replaceIcon, {signal});
}

function init(signal) {
	observe(is(branchSelector) + ':has(.octicon-tag)', addLink, {signal});
}

void features.add(import.meta.url, {
	include: [
		isRepoTree,
		isSingleFile,
	],
	init,
}, {
	include: [
		isReleasesOrTags,
		isSingleReleaseOrTag,
	],
	init: clarifyIcon,
});

/*

Test URLs:

- https://github.com/refined-github/refined-github/tree/23.11.15
- https://github.com/refined-github/refined-github/blob/23.4.10/.editorconfig

Second part:

- https://github.com/refined-github/refined-github/releases
- https://github.com/refined-github/refined-github/releases/tag/23.11.15
- https://github.com/saadeghi/daisyui/releases/tag/v4.4.15

*/
