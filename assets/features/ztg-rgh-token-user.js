import AlertIcon from '../npm/ztg-octicons-plain-react-components-Alert.js';
import React from '../npm/ztg-dom-chef.js';
import features from '../ztg-feature-manager.js';
import { api3 } from '../github-helpers/ztg-api.js';
import { tokenUser } from '../github-helpers/ztg-github-token.js';
import { getLoggedInUser } from '../github-helpers/ztg-index.js';
import onetime from '../helpers/ztg-onetime.js';
import { OptionsLink } from '../helpers/ztg-open-options.js';
import observe from '../helpers/ztg-selector-observer.js';
import { getToken } from '../ztg-options-storage.js';

async function verify(header) {
	const token = await getToken();
	if (!token) {
		return;
	}

	const currentWebUser = getLoggedInUser();
	const currentTokenUser = await tokenUser.get(api3, token);
	if (currentWebUser !== currentTokenUser) {
		header.after(
			// Use raw "flash" classes to blend in better with the dropdown menu
			React.createElement('div', { className: "flash flash-error px-3 tmp-px-3 mt-3 tmp-mt-3 mb-0 tmp-mb-0 py-2 tmp-py-2 d-flex flex-items-center border-0 rounded-0"             ,}
, React.createElement(AlertIcon, { className: "mr-2 tmp-mr-2" ,} )
, React.createElement('span', null, "Write API calls are blocked because your "
       , React.createElement(OptionsLink, { className: "btn-link",}, "Refined GitHub token"  ), ' ', "belongs to "
  , React.createElement('code', null, currentTokenUser), ", not "  , React.createElement('code', null, currentWebUser), "."
)
),
		);
	}
}

function initOnce() {
	observe('div[aria-labelledby="global-nav-user-menu-header"] > div[role="heading"]', verify);
}

void features.add(import.meta.url, {
	init: onetime(initOnce),
});

/*

Test URL: anywhere

*/
