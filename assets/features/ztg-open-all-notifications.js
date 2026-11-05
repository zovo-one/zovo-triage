import { clsx } from '../npm/ztg-clsx-clsx.js';
import delegate from '../npm/ztg-delegate-it-delegate.js';
import React from '../npm/ztg-dom-chef.js';
import { isNotifications } from '../npm/ztg-github-url-detection.js';
import LinkExternalIcon from '../npm/ztg-octicons-plain-react-components-LinkExternal.js';
import { $$, closestElement, elementExists, closestElementOptional, $, $$optional } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import { getIdentifiers } from '../helpers/ztg-feature-helpers.js';
import openTabs from '../helpers/ztg-open-tabs.js';
import observe from '../helpers/ztg-selector-observer.js';
import { withTooltipRef } from '../components/ztg-tooltip.js';
import { appendBefore } from '../helpers/ztg-dom-utils.js';

// Selector works on:
// https://github.com/notifications (Grouped by date)
// https://github.com/notifications (Grouped by repo)
// https://github.com/notifications?query=reason%3Acomment (which is an unsaved filter)
const notificationHeaderSelector = '.js-check-all-container .js-bulk-action-toasts ~ div .Box-header';

const openUnread = getIdentifiers('open-notifications-button');
const openSelected = getIdentifiers('open-selected-button');

function getUnreadNotifications(container = document) {
	return $$optional('.notification-unread', container);
}

async function openNotifications(notifications, markAsDone = false) {
	const urls = notifications
		.toReversed() // Open oldest first #6755
		.map(notification => $('a', notification).href);

	const didOpenTabs = await openTabs(urls);
	if (!didOpenTabs) {
		return false;
	}

	for (const notification of notifications) {
		if (markAsDone) {
			$('[title="Done"]', notification).click();
		} else {
			// Mark all as read instead
			notification.classList.replace('notification-unread', 'notification-read');
		}
	}

	return true;
}

function removeOpenUnreadButtons(container = document) {
	for (const button of $$(openUnread.selector, container)) {
		button.remove();
	}
}

async function openUnreadNotifications({delegateTarget, altKey}) {
	const container = closestElementOptional('.js-notifications-group', delegateTarget) ?? document;
	const unreadNotifications = getUnreadNotifications(container);
	const didOpenNotifications = await openNotifications(unreadNotifications, altKey);
	if (didOpenNotifications) {
		// Remove all now-unnecessary buttons
		removeOpenUnreadButtons(container);
	}
}

async function openSelectedNotifications() {
	const selectedNotifications = $$('.notifications-list-item :checked')
		.map(checkbox => closestElement('.notifications-list-item', checkbox));
	await openNotifications(selectedNotifications);

	if (!elementExists('.notification-unread')) {
		removeOpenUnreadButtons();
	}
}

function addSelectedButton(selectedActionsGroup) {
	appendBefore(
		selectedActionsGroup,
		'.js-notifications-mark-all',
		React.createElement('button', {
			ref: withTooltipRef({
				label: 'Open selected notifications',
				shortcut: 'p',
			}),
			type: "button",
			className: clsx('btn btn-sm mr-2 tmp-mr-2', openSelected.class),
			'data-hotkey': "p",}

, React.createElement(LinkExternalIcon, { className: "mr-1 tmp-mr-1" ,} ), "Open"
),
	);
}

function addToRepoGroup(markReadButton) {
	const repository = closestElement('.js-notifications-group', markReadButton);
	if (getUnreadNotifications(repository).length === 0) {
		return;
	}

	markReadButton.before(
		React.createElement('button', {
			ref: withTooltipRef({label: 'Open all unread notifications from this repo', direction: 'w'}),
			type: "button",
			className: clsx('btn btn-sm mr-2 tmp-mr-2', openUnread.class),}

, React.createElement(LinkExternalIcon, { width: 16,} ), " Open unread"
),
	);
}

function addToMainHeader(notificationHeader) {
	if (getUnreadNotifications().length === 0) {
		return;
	}

	notificationHeader.append(
		React.createElement('button', { className: clsx('btn btn-sm ml-auto d-none', openUnread.class), type: "button",}
, React.createElement(LinkExternalIcon, { className: "mr-1 tmp-mr-1" ,} ), "Open all unread"
),
	);
}

function init(signal) {
	delegate(openSelected.selector, 'click', openSelectedNotifications, {signal});
	delegate(openUnread.selector, 'click', openUnreadNotifications, {signal});

	observe(notificationHeaderSelector + ' .js-notifications-mark-selected-actions', addSelectedButton, {signal});
	observe(notificationHeaderSelector, addToMainHeader, {signal});
	observe('.js-grouped-notifications-mark-all-read-button', addToRepoGroup, {signal});
}

void features.add(import.meta.url, {
	include: [
		isNotifications,
	],
	shortcuts: {
		p: 'Open selected notifications',
	},
	init,
});

/*

Test URLs:

https://github.com/notifications (Grouped by date)
https://github.com/notifications (Grouped by repo)
https://github.com/notifications?query=reason%3Acomment (which is an unsaved filter)

*/
