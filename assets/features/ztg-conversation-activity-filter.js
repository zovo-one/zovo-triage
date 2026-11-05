import { isConversation, isPR } from '../npm/ztg-github-url-detection.js';
import { $, elementExists, $$optional, $$ } from '../npm/ztg-select-dom.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { get } from '../npm/ztg-svelte-store-shared.js';
import { mount } from '../npm/ztg-svelte-internal-client-render.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import features from '../ztg-feature-manager.js';
import getCommentAuthor from '../github-helpers/ztg-get-comment-author.js';
import { registerHotkey } from '../github-helpers/ztg-hotkey.js';
import { fetchStateForCurrentUrl, syncWrapper, activityFilterState, states } from '../helpers/ztg-conversation-activity-filter.js';
import delay from '../helpers/ztg-delay.js';
import observe from '../helpers/ztg-selector-observer.js';
import Conversation_activity_filter from './ztg-conversation-activity-filter.svelte.js';
import { is, has } from '../helpers/ztg-css-selectors.js';

const hiddenClassName = 'rgh-conversation-activity-filtered-event';
const collapsedClassName = 'rgh-conversation-activity-collapsed-comment';
const botClassName = 'rgh-conversation-activity-bot-comment';
const timeline = [
	// PR
	'[class^="prc-PageLayout-PageLayoutWrapper"]',
	// Issue
	'[class*="IssueViewer-module__mainContainer"]',
] ;
const timelineItem = [
	'.js-timeline-item',
	// React issue pages
	'[data-wrapper-timeline-id]:not([data-wrapper-timeline-id="load-top"])', // Exclude "Load more" button
];
const comment = ['.comment-body', '.react-issue-comment'];

function processTimelineEvent(item) {
	// Don't hide commits in PR conversation timelines #5581
	if (isPR() && elementExists('.TimelineItem-badge .octicon-git-commit', item)) {
		return;
	}

	item.classList.add(hiddenClassName);
}

function processSimpleComment(item) {
	// Hide comments marked as resolved/hidden
	if (elementExists('.octicon-unfold', item)) {
		item.classList.add(collapsedClassName);
	}

	if (getCommentAuthor($(comment, item)).endsWith('[bot]')) {
		item.classList.add(botClassName);
	}
}

function processDismissedReviewEvent(item) {
	item.classList.add(hiddenClassName);

	// Find and hide stale reviews referenced by dismissed review events
	for (const {hash: staleReviewId} of $$('.TimelineItem-body > a[href^="#pullrequestreview-"]', item)) {
		$(is(timelineItem) + has(staleReviewId))
			.classList
			.add(collapsedClassName);
	}
}

function processReview(review) {
	const hasMainComment = elementExists('.js-comment[id^=pullrequestreview] .timeline-comment', review);

	// Don't combine the selectors or use early returns without understanding what a thread or thread comment is
	// Resolved thread are handled by the CSS thanks to [data-resolved="true"]
	const unresolvedThreads = $$optional('.js-resolvable-timeline-thread-container[data-resolved="false"]', review);
	const unresolvedThreadComments = $$optional('.timeline-comment-group:not(.minimized-comment)', review);

	if (!hasMainComment && (unresolvedThreads.length === 0 || unresolvedThreadComments.length === 0)) {
		review.classList.add(collapsedClassName); // The whole review is essentially resolved
		return;
	}

	for (const thread of unresolvedThreads) {
		// Hide threads containing only resolved comments
		if (unresolvedThreadComments.every(unresolvedComment => !thread.contains(unresolvedComment))) {
			thread.classList.add(collapsedClassName);
		}
	}
}

function processItem(item) {
	// Exclude deep-linked comment
	if (location.hash.startsWith('#issuecomment-') && elementExists(location.hash, item)) {
		return;
	}

	if (elementExists('.js-comment[id^=pullrequestreview]', item)) {
		processReview(item);
	} else if (elementExists('.TimelineItem-badge .octicon-x', item)) {
		processDismissedReviewEvent(item);
	} else if (elementExists(comment, item)) {
		processSimpleComment(item);
	} else {
		processTimelineEvent(item);
	}
}

async function addWidget(anchor) {
	if (anchor.classList.contains('rgh-conversation-activity-filter')) {
		return;
	}

	await delay(100); // Let `clean-conversation-headers` run first
	anchor.classList.add('rgh-conversation-activity-filter');
	mount(Conversation_activity_filter, {
		target: anchor,
	});
}

function uncollapseTargetedComment() {
	if (location.hash.startsWith('#issuecomment-')) {
		$(is(timelineItem) + has(`.${collapsedClassName} ${location.hash}`))
			.classList
			.remove(collapsedClassName);
	}
}

function switchToNextFilter() {
	const stateNames = Object.keys(states);
	const nextIndex = stateNames.indexOf(get(activityFilterState)) + 1;
	const nextState = stateNames.length > nextIndex ? stateNames[nextIndex] : stateNames[0];

	activityFilterState.set(nextState );
}

async function init(signal) {
	fetchStateForCurrentUrl();
	registerHotkey('h', switchToNextFilter, {signal});

	globalThis.addEventListener('hashchange', uncollapseTargetedComment, {signal});
	observe(timeline, syncWrapper, {signal});
	observe(timelineItem, processItem, {signal});
	observe(
		[
			// Issue view
			'[class^="HeaderMetadata-module__metadataContent"]',
			'[class*="HeaderMetadata-module__smallMetadataRow"]',
			// PR view
			'[class*="PullRequestHeaderSummary-module"] > .d-flex',
		],
		addWidget,
		{signal},
	);
}

void features.add(import.meta.url, {
	include: [
		isConversation,
	],
	shortcuts: {
		h: 'Cycle through conversation activity filters',
	},
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github/pull/4030
https://github.com/refined-github/refined-github/issues/4008

*/
