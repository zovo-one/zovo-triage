import React from '../npm/ztg-dom-chef.js';
import { hasRepoHeader, isOrganizationProfile } from '../npm/ztg-github-url-detection.js';
import { clsx } from '../npm/ztg-clsx-clsx.js';
import features from '../ztg-feature-manager.js';
import getUserAvatar from '../github-helpers/ztg-get-user-avatar.js';
import { getRepo } from '../github-helpers/ztg-index.js';
import { isSmallDevice } from '../helpers/ztg-dom-utils.js';
import observe from '../helpers/ztg-selector-observer.js';

async function add(ownerLabel) {
	const username = getRepo().owner;
	const size = 16;
	const source = getUserAvatar(username, size);

	ownerLabel.parentElement.classList.add('d-flex', 'flex-items-center');

	ownerLabel.prepend(
		React.createElement('img', {
			className: clsx(
				'avatar mr-2 tmp-mr-2',
				!isOrganizationProfile() && 'avatar-user',
			),
			src: source,
			width: size,
			height: size,
			alt: `@${username}`,}
		),
	);
}

function init(signal) {
	const username = getRepo().owner;
	observe('.loaded nav[data-component="Breadcrumbs"] a[href="/' + username + '"]', add, {signal});
}

void features.add(import.meta.url, {
	include: [
		hasRepoHeader,
	],
	exclude: [
		isSmallDevice,
	],
	init,
});

/*

## Test URLs

- org repo: https://github.com/refined-github/refined-github/issues
- user repo: https://github.com/fregante/GhostText/issues

*/
