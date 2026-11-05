import '../npm/ztg-svelte-internal-client-constants.js';
import { mount } from '../npm/ztg-svelte-internal-client-render.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import delegate from '../npm/ztg-delegate-it-delegate.js';
import elementReady from '../npm/ztg-element-ready.js';
import filterAlteredClicks from '../npm/ztg-filter-altered-clicks.js';
import { isPRConversation, isPRFiles } from '../npm/ztg-github-url-detection.js';
import { $ } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import api from '../github-helpers/ztg-api.js';
import { getConversationNumber, scrollIntoViewIfNeeded, triggerConversationUpdate } from '../github-helpers/ztg-index.js';
import showToast from '../github-helpers/ztg-toast.js';
import delay from '../helpers/ztg-delay.js';
import { randomArrayItem } from '../helpers/ztg-math.js';
import observe, { waitForElement } from '../helpers/ztg-selector-observer.js';
import Quick_review from './ztg-quick-review.svelte.js';

const emojis = ['🚀', '🐿️', '⚡️', '🤌', '🥳', '🥰', '🤩', '🥸', '😎', '🤯', '🚢', '🛫', '🏳️', '🏁'];

// Be careful not to select the "Submit review" button in the dialog
const reviewMenuButtonSelector = 'button[class*="ReviewMenuButton-module__ReviewMenuButton"]';
const openReviewMenuDeepLink = 'review-changes-modal';
const openReviewMenuDeepLinkSelector = `#${openReviewMenuDeepLink}`;
const prFilesChangedTabSelector = [
	'a#prs-files-anchor-tab',
	// GHES still uses the legacy files tab without this ID #9937
	'a.tabnav-tab[href$="/files"]',
] ;

const isOldPrFiles = () => $(prFilesChangedTabSelector).href.endsWith('files');

async function quickApprove(event) {
	const approval = event.altKey ? '' : prompt('Approve instantly? You can add a custom message or leave empty');
	if (approval === null) {
		return;
	}

	const call = api.v3uncached(`pulls/${getConversationNumber()}/reviews`, {
		method: 'POST',
		body: {event: 'APPROVE', body: approval},
	});

	await showToast(call, {
		message: 'Approving…',
		doneMessage: `${randomArrayItem(emojis)} Approved`,
	});

	// Update timeline and scroll to bottom so the new review appears in view
	scrollIntoViewIfNeeded($('#partial-timeline'));
	triggerConversationUpdate();
}

async function openReviewDialogWhenAvailable(event) {
	event.preventDefault();
	$(prFilesChangedTabSelector).click();

	const signal = AbortSignal.timeout(10_000);
	const reviewMenuButton = await waitForElement(reviewMenuButtonSelector, {signal});
	reviewMenuButton.click();
}

function preloadPrFilesTab() {
	$(prFilesChangedTabSelector).dispatchEvent(new MouseEvent('mouseover', {bubbles: true}));
}

async function addButtons(reviewersSection) {
	// Occasionally this button appears before "Reviewers", so let's wait a bit longer
	await delay(300);

	mount(Quick_review, {
		target: reviewersSection,
		props: isOldPrFiles()
			? {
				onApprove: quickApprove,
			}
			: {
				onReview: filterAlteredClicks(openReviewDialogWhenAvailable),
				onApprove: quickApprove,
				onPreload: preloadPrFilesTab,
			},
	});
}

// TODO [2027-01-01]: Drop after the legacy PR files view is removed
function focusReviewTextarea(event) {
	if ('newState' in event && event.newState === 'open') {
		$('textarea', event.delegateTarget).focus();
	}
}

async function initReviewButtonEnhancements(signal) {
	delegate(openReviewMenuDeepLinkSelector, 'toggle', focusReviewTextarea, {capture: true, signal});

	const reviewDropdownButton = await elementReady([
		reviewMenuButtonSelector,
		// TODO [2027-01-01]: Drop after the legacy PR files view is removed
		'.js-reviews-toggle',
	]);
	if (reviewDropdownButton) {
		reviewDropdownButton.dataset.hotkey = 'v';
	}
}

// TODO [2027-01-01]: Drop after legacy PR files view is removed
async function openReviewPopup(button) {
	await delay(100); // The popover appears immediately afterwards in the HTML, observe() might trigger too soon
	(button.popoverTargetElement ).showPopover();
}

function openReviewDialog(reviewMenuButton) {
	reviewMenuButton.click();
}

async function initAutoOpenPopup(signal) {
	// TODO [2027-01-01]: Drop after legacy PR files view is removed
	observe(reviewMenuButtonSelector, openReviewDialog, {signal, once: true});

	// Cannot target the [popover] itself because observe() can't see hidden elements
	observe(`[popovertarget="${openReviewMenuDeepLink}"]`, openReviewPopup, {signal, once: true});
}

async function init(signal) {
	observe('[aria-label="Select reviewers"] .discussion-sidebar-heading:not(#collapsible-reviewers-without-write)', addButtons, {signal});
}

void features.add(import.meta.url, {
	shortcuts: {
		v: 'Review PR',
	},
	include: [
		isPRConversation,
	],
	init,
}, {
	shortcuts: {
		v: 'Open PR review popup',
	},
	include: [
		isPRFiles,
	],
	init: initReviewButtonEnhancements,
}, {
	asLongAs: [
		() => location.hash === openReviewMenuDeepLinkSelector,
		isPRFiles,
	],
	init: initAutoOpenPopup,
});

/*

Test URLs:

- Open PR (review, approve) https://github.com/refined-github/sandbox/pull/10
- Closed PR (only review) https://github.com/refined-github/sandbox/pull/26
- PRs with your review requested: https://github.com/pulls/review-requested

*/
