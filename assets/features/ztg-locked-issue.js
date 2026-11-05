import { clsx } from '../npm/ztg-clsx-clsx.js';
import { isConversation } from '../npm/ztg-github-url-detection.js';
import LockIcon from '../npm/ztg-octicons-plain-react-components-Lock.js';
import React from '../npm/ztg-dom-chef.js';
import features from '../ztg-feature-manager.js';
import isConversationLocked from '../github-helpers/ztg-is-conversation-locked.js';
import { getIdentifiers } from '../helpers/ztg-feature-helpers.js';
import observe from '../helpers/ztg-selector-observer.js';
import { featureClass as featureClass$1 } from './ztg-jump-to-conversation-close-event.js';

const {class: featureClass} = getIdentifiers(import.meta.url);

function LockedIndicator() {
	return (
		React.createElement('span', { title: "Locked", className: clsx('State d-flex flex-items-center flex-shrink-0', featureClass),}
, React.createElement(LockIcon, { className: "flex-items-center mr-1 tmp-mr-1"  ,} ), "Locked"

)
	);
}

function addLock(stateLabel) {
	const isWrapped = stateLabel.parentElement.classList.contains(featureClass$1);
	const container = isWrapped ? stateLabel.parentElement : stateLabel;

	container.parentElement.style.height = 'auto';
	container.parentElement.classList.add('d-flex', 'gap-2');
	container.after(React.createElement(LockedIndicator, null ));
}

async function init(signal) {
	observe(
		'div:is([data-testid^="issue-metadata"], [class^="prc-PageLayout-Header"]) span[class^="prc-StateLabel"]',
		addLock,
		{signal},
	);
}

void features.add(import.meta.url, {
	asLongAs: [
		isConversation,
		async () => await isConversationLocked() ?? false,
	],
	init,
});

/*

## Test URLs

- Locked issue: https://github.com/refined-github/sandbox/issues/74
- Locked PR: https://github.com/refined-github/sandbox/pull/48

*/

export { featureClass };
