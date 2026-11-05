import React from '../npm/ztg-dom-chef.js';
import { is404, isRepoTree } from '../npm/ztg-github-url-detection.js';
import PencilIcon from '../npm/ztg-octicons-plain-react-components-Pencil.js';
import { $ } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import GitHubFileUrl from '../github-helpers/ztg-github-file-url.js';
import { isArchivedRepoAsync, isPermalink } from '../github-helpers/ztg-index.js';
import { directoryListingFileIcon } from '../github-helpers/ztg-selectors.js';
import { wrap } from '../helpers/ztg-dom-utils.js';
import observe from '../helpers/ztg-selector-observer.js';

async function linkifyIcon(fileIcon) {
	const fileLink = $('.react-directory-filename-cell a', fileIcon.parentElement);

	const url = new GitHubFileUrl(fileLink.href).assign({
		route: 'edit',
	});

	wrap(fileIcon, React.createElement('a', { href: url.href, className: "rgh-quick-file-edit",} ));
	fileIcon.after(React.createElement(PencilIcon, null ));
}

async function init(signal) {
	observe(directoryListingFileIcon, linkifyIcon, {signal});
}

void features.add(import.meta.url, {
	include: [
		isRepoTree,
	],
	exclude: [
		is404,
		isArchivedRepoAsync,
		isPermalink,
	],
	init,
});

/*

Test URLs

Legacy views: https://github.com/refined-github/refined-github
React views: https://github.com/refined-github/refined-github/tree/main/.github

*/
