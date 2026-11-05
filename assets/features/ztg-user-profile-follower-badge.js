import React from '../npm/ztg-dom-chef.js';
import elementReady from '../npm/ztg-element-ready.js';
import { isOwnUserProfile, isPrivateUserProfile, isUserProfile } from '../npm/ztg-github-url-detection.js';
import '../npm/ztg-webext-storage-cache.js';
import features from '../ztg-feature-manager.js';
import api from '../github-helpers/ztg-api.js';
import { getCleanPathname, getLoggedInUser } from '../github-helpers/ztg-index.js';
import attachElement from '../helpers/ztg-attach-element.js';
import CachedFunction from '../npm/ztg-webext-storage-cache-cached-function.js';

const doesUserFollow = new CachedFunction('user-follows', {
	async updater(userA, userB) {
		const {httpStatus} = await api.v3(`/users/${userA}/following/${userB}`, {
			responseFormat: 'text',
			ignoreHttpStatus: true,
		});

		return httpStatus === 204;
	},
});

async function init() {
	if (!await doesUserFollow.get(getCleanPathname(), getLoggedInUser())) {
		return;
	}

	const target = await elementReady('.js-profile-editable-area [href$="?tab=following"]');
	attachElement(target, {
		after: () => (
			React.createElement('span', { className: "color-fg-muted",}, " · Follows you"   )
		),
	});
}

void features.add(import.meta.url, {
	include: [
		isUserProfile,
	],
	exclude: [
		isOwnUserProfile,
		isPrivateUserProfile,
	],
	init,
});

/*

Test URLs:

1. Visit your own profile
2. Click on "X followers" below your profile picture
3. Click on a follower
4. Look for a "Follows you" badge below their profile picture

*/
