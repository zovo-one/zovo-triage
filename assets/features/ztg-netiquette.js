import { isConversation, isPRFiles, hasComments } from '../npm/ztg-github-url-detection.js';
import { closestElementOptional } from '../npm/ztg-select-dom.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { mount } from '../npm/ztg-svelte-internal-client-render.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import features from '../ztg-feature-manager.js';
import { newCommentField } from '../github-helpers/ztg-selectors.js';
import observe from '../helpers/ztg-selector-observer.js';
import Netiquette from './ztg-netiquette.svelte.js';

function mountBanner(commentField) {
	const reactWrapper = closestElementOptional('[class^="InlineAutocomplete"]', commentField);
	const target = reactWrapper ?? commentField;
	mount(Netiquette, {
		target,
		anchor: target.firstElementChild,
		props: {
			legacy: !reactWrapper,
		},
	});
}

function makeFieldKinder(field) {
	if (field.textContent.trim() === 'Add your comment here...') {
		// Regular issue/PR comment field, or single review comments
		// https://github.com/refined-github/refined-github/pull/6991
		field.textContent = 'Add your comment here, be kind';
	} else if (field.textContent.trim() === 'Leave a comment') {
		// Main review comment field
		// https://github.com/refined-github/refined-github/pull/6991/files
		field.textContent = 'Leave a comment, be kind';
	} else {
		throw new Error(`Unexpected placeholder text: ${field.textContent}`);
	}
}

function makeReactFieldKinder(field) {
	field.placeholder = 'Add your comment here, be kind';
}

function initKindness(signal) {
	observe('p.CommentBox-placeholder', makeFieldKinder, {signal});
	observe(
		[
			'textarea[placeholder="Use Markdown to format your comment"]', // On issues
			'textarea[placeholder="Leave a comment"]', // On single commits
		],
		makeReactFieldKinder,
		{signal},
	);
}

function initBanner(signal) {
	observe(newCommentField, mountBanner, {signal});
}

void features.add(import.meta.url, {
	include: [
		isConversation,
		isPRFiles,
	],
	awaitDomReady: true, // The comment field is at the end
	init: initBanner,
}, {
	include: [
		hasComments,
	],
	awaitDomReady: true, // The comment field is at the end
	init: initKindness,
});

/*

Test URLs

- Old issue: https://togithub.com/facebook/react/issues/227
- Popular issue: https://togithub.com/facebook/react/issues/13991
- Old and popular issue: https://togithub.com/react/react/issues/28313
- Old PR: https://togithub.com/facebook/react/pull/209
- Draft PR: https://togithub.com/react/react/pull/19377
- Draft PR files: https://togithub.com/react/react/pull/19377/files

*/
