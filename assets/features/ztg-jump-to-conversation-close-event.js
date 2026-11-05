import debounceFunction from '../npm/ztg-debounce-fn.js';
import React from '../npm/ztg-dom-chef.js';
import { isConversation, isClosedConversation } from '../npm/ztg-github-url-detection.js';
import { lastElement, $, $$ } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import { conversationCloseEvent } from '../github-helpers/ztg-selectors.js';
import { wrap } from '../helpers/ztg-dom-utils.js';
import { getIdentifiers } from '../helpers/ztg-feature-helpers.js';
import observe from '../helpers/ztg-selector-observer.js';
import addTooltip from '../components/ztg-tooltip.js';

const statusBadgeSelector = [
	'span[class*="StateLabel"]',
	// TODO [2026-09-01]: Drop both
	'#partial-discussion-header .State:not(.rgh-locked-issue)',
	'[data-testid="header-state"]',
] ;

const {class: featureClass} = getIdentifiers(import.meta.url);

function updateStatusBadges() {
	// Not processing the element that has been observed because past events may load in the middle of the page
	const lastCloseEvent = lastElement(conversationCloseEvent);
	const eventAnchor = $('a[href*="#event-"]', lastCloseEvent);
	const statusBadges = $$(statusBadgeSelector);

	for (const statusBadge of statusBadges) {
		const maybeWrapper = statusBadge.parentElement;
		if (maybeWrapper.classList.contains(featureClass)) {
			(maybeWrapper ).href = eventAnchor.href;
		} else {
			// Avoid native `title` by disabling pointer events, we have our own tooltips. We can't drop the `title` attribute because some features depend on it.
			statusBadge.style.pointerEvents = 'none';
			const link = (
				React.createElement('a', {
					className: featureClass,
					href: eventAnchor.href,}
				)
			);
			wrap(
				statusBadge,
				link,
			);
			addTooltip({label: 'Scroll to most recent close event', direction: 'e'}, link);
		}
	}
}

function init(signal) {
	observe(
		conversationCloseEvent,
		// Avoid calling `updateStatusBadges` for every close event on initial load
		debounceFunction(updateStatusBadges, {wait: 100}),
		{signal},
	);
}

void features.add(import.meta.url, {
	asLongAs: [
		isConversation,
		isClosedConversation,
	],
	awaitDomReady: true, // We're specifically looking for the last event
	init,
});

/*

Test URLs:

- Closed Issue: https://github.com/refined-github/sandbox/issues/2
- Closed Issue (Not Planned): https://github.com/refined-github/sandbox/issues/24
- Merged PR: https://github.com/refined-github/sandbox/pull/23
- Closed PR: https://github.com/refined-github/sandbox/pull/22

*/

export { featureClass, statusBadgeSelector };
