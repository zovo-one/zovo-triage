import { isConversation } from '../npm/ztg-github-url-detection.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { mount } from '../npm/ztg-svelte-internal-client-render.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import features from '../ztg-feature-manager.js';
import { isRefinedGitHubRepo } from '../github-helpers/ztg-index.js';
import observe from '../helpers/ztg-selector-observer.js';
import { getCloseDate, wasLongAgo } from '../github-helpers/ztg-netiquette.js';
import Rgh_netiquette from './ztg-rgh-netiquette.svelte.js';

async function addConversationBanner(newCommentBox) {
	// Check inside the observer because React views load after dom-ready
	const closingDate = await getCloseDate();
	if (!closingDate || !wasLongAgo(closingDate)) {
		features.unload(import.meta.url);
		return;
	}

	mount(Rgh_netiquette, {
		target: newCommentBox.parentElement,
		anchor: newCommentBox,
		props: {
			closingDate,
			onReveal() {
				newCommentBox.hidden = false;
				newCommentBox.scrollIntoView({behavior: 'smooth'});
			},
		},
	});
	newCommentBox.hidden = true;
}

function init(signal) {
	observe(
		[
			'#issuecomment-new:has(file-attachment)',
			'[data-testid="comment-composer"]',
		],
		addConversationBanner,
		{signal},
	);
}

void features.add(import.meta.url, {
	asLongAs: [
		isRefinedGitHubRepo,
	],
	include: [
		isConversation,
	],
	awaitDomReady: true, // The comment field is at the end
	init,
});

/*

Test URLs

- Old issue: https://github.com/refined-github/refined-github/issues/3076
- Old PR: https://github.com/refined-github/refined-github/pull/159

*/
