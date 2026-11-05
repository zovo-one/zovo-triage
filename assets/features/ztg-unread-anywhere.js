import React from '../npm/ztg-dom-chef.js';
import { isGist } from '../npm/ztg-github-url-detection.js';
import ArrowUpRightIcon from '../npm/ztg-octicons-plain-react-components-ArrowUpRight.js';
import { $$optional, $ } from '../npm/ztg-select-dom.js';
import { messageRuntime } from '../npm/ztg-webext-msg.js';
import features from '../ztg-feature-manager.js';
import { registerHotkey } from '../github-helpers/ztg-hotkey.js';
import showToast from '../github-helpers/ztg-toast.js';
import { isSmallDevice, getClasses, wrap } from '../helpers/ztg-dom-utils.js';
import { fetchDomUncached as fetchDom } from '../helpers/ztg-fetch-dom.js';
import onetime from '../helpers/ztg-onetime.js';
import pluralize from '../helpers/ztg-pluralize.js';
import observe from '../helpers/ztg-selector-observer.js';
import addTooltip from '../components/ztg-tooltip.js';
import { removeLinkToPrFilesTab } from './ztg-pr-notification-link.js';

const limit = 5;

const buttonWithNotificationsSelector = '.loaded a[class*="notificationIndicator"]';

function removeNotificationIndicator(element) {
	for (const className of element.classList) {
		if (className.includes('notificationIndicator')) {
			element.classList.remove(className);
		}
	}
}

async function openUnreadNotifications({currentTarget: button}) {
	// Hide the tooltip
	button.blur();

	// Prevent multiple clicks
	button.disabled = true;

	await showToast(async updateToast => {
		const page = await fetchDom('/notifications?query=is%3Aunread');

		const notifications = $$optional('a.js-navigation-open', page);
		if (notifications.length === 0) {
			updateToast('No unread notifications');
			return;
		}

		updateToast('Opening…');
		const urls = notifications.slice(0, limit).map(notification => {
			removeLinkToPrFilesTab(notification); // Internally limited to PR Files links
			return notification.href;
		});

		await messageRuntime({
			openUrls: urls,
		});

		if (notifications.length > limit) {
			updateToast(`Opened the last ${limit} unread notifications`);
		} else {
			updateToast(pluralize(urls.length, '$$ notification') + ' opened');
			// Update the UI too
			removeNotificationIndicator($(buttonWithNotificationsSelector));
		}
	}, {
		message: 'Loading notifications…',
		doneMessage: false,
	}).finally(() => {
		button.disabled = false;
	});
}

async function addButton(nativeLink) {
	const classes = getClasses(nativeLink);
	const button = (
		React.createElement('button', {
			type: "button",
			onClick: openUnreadNotifications,
			// Show pointer cursor even when disabled
			style: {width: 15, cursor: 'pointer'},
			className: "rounded-left-0 border-left-0 d-block p-0 tmp-p-0"    ,}

, React.createElement(ArrowUpRightIcon, { className: "mb-2 tmp-mb-2" , style: {marginLeft: -1},} )
)
	);

	// Reverse order so that the new button is painted below the "unread indicator"
	// Also has an rgh- class so that it can be targeted via CSS and deduplicated
	wrap(nativeLink, React.createElement('div', { className: "d-flex flex-row-reverse rgh-unread-anywhere-wrapper"  ,} ));

	nativeLink.before(button);
	nativeLink.style.width = '30px'; // Reduce width of native button
	button.setAttribute('data-variant', 'invisible'); // Enables hover style
	button.classList.add(...classes);
	removeNotificationIndicator(button);

	addTooltip({
		label: 'Open unread notifications',
		shortcut: 'g u',
		direction: 'sw',
	}, button);
}

// No signal, created once per load
function initOnce() {
	registerHotkey('g u', openUnreadNotifications);
	document.documentElement.classList.add('rgh-unread-anywhere');
	observe(buttonWithNotificationsSelector + ':not(.rgh-unread-anywhere-wrapper *)', addButton);
}

void features.add(import.meta.url, {
	shortcuts: {
		'g u': 'Open all unread notifications from anywhere',
	},
	exclude: [
		// Disable the feature entirely on small screens
		isSmallDevice,

		// Can't work on gists due to CORS: https://github.com/refined-github/refined-github/issues/8641
		isGist,
	],
	init: onetime(initOnce),
});

/*

Test URLs: anywhere :)

*/
