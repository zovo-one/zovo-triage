import '../npm/ztg-svelte-internal-client-constants.js';
import { readable, writable } from '../npm/ztg-svelte-store-shared.js';
import { mount } from '../npm/ztg-svelte-internal-client-render.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import { isConversation, isEnterprise } from '../npm/ztg-github-url-detection.js';
import { $ } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import { getRepo, getConversationNumber } from '../github-helpers/ztg-index.js';
import observe from '../helpers/ztg-selector-observer.js';
import Status_subscription from './ztg-status-subscription.svelte.js';

function getSubscriptionReasonElement() {
	return $([
		'#issue-viewer-subscription-description',
		'#notification-subscribe-button-reason', // Legacy
	]);
}

function getSubscriptionReason() {
	const reason = getSubscriptionReasonElement().textContent;

	// You’re receiving notifications because you chose custom settings for this thread.
	if (reason.includes('custom settings')) {
		return 'status';
	}

	// You’re not receiving notifications from this thread.
	if (reason.includes('not receiving')) {
		return 'none';
	}

	return 'all';
}

// TODO: Move to CSS after legacy version is dropped
function toggleSubscriptionReason(status) {
	// 'all' can have many reasons, but the other two don't add further information #6684
	getSubscriptionReasonElement().hidden = status !== 'all';
}

function addLegacyButton(nativeButton) {
	const initialStatus = getSubscriptionReason();

	// The whole block is removed and re-loaded in the legacy version, so these don't need to be writable
	const status = readable(initialStatus);
	const disabled = readable(false);

	// Save first
	const originalId = nativeButton.form.elements.id;

	mount(Status_subscription, {
		target: nativeButton.parentElement,
		anchor: nativeButton,
		props: {
			status,
			disabled,
			isLegacy: true,
		},
	});

	// Remove it only if the form was successfully added
	originalId.remove();
	nativeButton.hidden = true;

	toggleSubscriptionReason(initialStatus);
}

const githubApiBaseHeaders = new Headers({
	accept: 'application/json',
	'github-verified-fetch': 'true',
	'x-github-client-version':
		'Refined GitHub. Please address https://github.com/orgs/community/discussions/132506#discussioncomment-11294985',
	credentials: 'include',
});

async function fetchIssueData() {
	const {owner, name} = getRepo();
	const body = {
		// `IssueViewerSecondaryViewQuery`
		query: 'cb9b35846fadf5f80ec3a2c05bf42a89',
		variables: {number: getConversationNumber(), owner, repo: name},
	};
	const url = new URL('/_graphql', location.origin);
	url.searchParams.set('body', JSON.stringify(body));

	const response = await fetch(url, {headers: githubApiBaseHeaders});
	if (!response.ok) {
		throw new Error('Failed to fetch the issue');
	}

	const {data} = await response.json();
	return data;
}

async function updateSubscription(targetStatus, id) {
	const response = await fetch('/_graphql', {
		headers: githubApiBaseHeaders,
		method: 'POST',
		body: JSON.stringify({
			// `updateIssueSubscriptionMutation`
			query: 'd0752b2e49295017f67c84f21bfe41a3',
			variables: {
				input: {
					events: targetStatus === 'status' ? ['CLOSED', 'REOPENED'] : [],
					state: targetStatus === 'status' ? 'CUSTOM' : targetStatus === 'all' ? 'SUBSCRIBED' : 'UNSUBSCRIBED',
					subscribableId: id,
				},
			},
		}),
	});
	if (!response.ok) {
		throw new Error('Failed to update the issue subscription status');
	}
}

async function renderWidget(nativeButton) {
	const issue = await fetchIssueData();
	const {id, viewerThreadSubscriptionFormAction, viewerCustomSubscriptionEvents} = issue.repository.issue;

	const initialStatus =
		// eslint-disable-next-line unicorn/no-negated-condition
		viewerThreadSubscriptionFormAction !== 'UNSUBSCRIBE'
			? 'none'
			: viewerCustomSubscriptionEvents.length > 0
				? 'status'
				: 'all';

	const status = writable(initialStatus);
	const disabled = writable(false);

	const makeOnClick = (target) => async () => {
		disabled.set(true);

		try {
			await updateSubscription(target, id);

			status.set(target);
			toggleSubscriptionReason(target);
		} finally {
			disabled.set(false);
		}
	};

	mount(Status_subscription, {
		target: nativeButton.parentElement,
		anchor: nativeButton,
		props: {
			status,
			disabled,
			isLegacy: false,
			onNone: makeOnClick('none'),
			onAll: makeOnClick('all'),
			onStatus: makeOnClick('status'),
		},
	});

	toggleSubscriptionReason(initialStatus);
	nativeButton.hidden = true;
}

function init(signal) {
	// Repos you're ignoring can't be subscribed to, so the button is disabled
	observe('button[data-thread-subscribe-button]:enabled', addLegacyButton, {signal});
	if (!isEnterprise()) {
		observe('button[aria-describedby*="issue-viewer-subscription-description"]', renderWidget, {signal});
	}
}

void features.add(import.meta.url, {
	include: [
		isConversation,
	],
	awaitDomReady: true, // The sidebar is at the end of the page
	init,
});

/*

Test URLs

- Issue: https://github.com/refined-github/sandbox/issues/3
- PR: https://github.com/refined-github/sandbox/pull/4
- Also test a repo you're completely ignoring

*/
