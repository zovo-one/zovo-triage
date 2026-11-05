import React from '../npm/ztg-dom-chef.js';
import { isOwnUserProfile } from '../npm/ztg-github-url-detection.js';
import EyeClosedIcon from '../npm/ztg-octicons-plain-react-components-EyeClosed.js';
import '../npm/ztg-webext-storage-cache.js';
import features from '../ztg-feature-manager.js';
import api from '../github-helpers/ztg-api.js';
import { getLoggedInUser } from '../github-helpers/ztg-index.js';
import observe from '../helpers/ztg-selector-observer.js';
import CachedFunction from '../npm/ztg-webext-storage-cache-cached-function.js';

const publicOrganizationsNames = new CachedFunction('public-organizations', {
	async updater(username) {
		// API v4 seems to *require* `org:read` permission AND it includes private organizations as well, which defeats the purpose. There's no way to filter them.
		// GitHub's API explorer inexplicably only includes public organizations.
		const response = await api.v3(`/users/${username}/orgs`);
		return response.map((organization) => organization.login);
	},
	maxAge: {hours: 6},
	staleWhileRevalidate: {days: 10},
});

function markPrivate(org, organizations) {
	if (organizations.includes(org.pathname.replace(/^\/(?:organizations\/)?/, ''))) {
		return;
	}

	org.classList.add('rgh-private-org');
	org.append(React.createElement(EyeClosedIcon, null ));
}

async function init(signal) {
	const organizations = await publicOrganizationsNames.get(getLoggedInUser());
	observe(
		'a.avatar-group-item[data-hovercard-type="organization"][itemprop="follows"]',
		org => {
			markPrivate(org, organizations);
		},
		{signal, stopOnDomReady: true},
	);
}

void features.add(import.meta.url, {
	include: [
		isOwnUserProfile,
	],
	init,
});

/*

Test URLs:

https://github.com/YOUR_USERNAME

*/
