import delegate from '../npm/ztg-delegate-it-delegate.js';
import features from '../ztg-feature-manager.js';

const hasNotificationBar = () =>
	location.search.startsWith('?notification_referrer_id=')
	|| JSON.parse(sessionStorage.getItem('notification_shelf') ?? '{}').pathname === location.pathname;

function handleClick(event) {
	// Disable the redirect to the Notifications inbox if either:
	// 1. The alt key was held down during click (user choice)
	// 2. The notification has been opened in a new tab (the inbox is still open in the previous tab)
	const isRedirectDisabled = event.altKey || sessionStorage.rghIsNewTab === 'true';
	event.delegateTarget.form.toggleAttribute('data-redirect-to-inbox-on-submit', !isRedirectDisabled);
}

function init(signal) {
	sessionStorage.rghIsNewTab = history.length === 1;
	delegate('.notification-shelf .js-notification-action button', 'click', handleClick, {signal});
}

void features.add(import.meta.url, {
	include: [
		hasNotificationBar,
	],
	init,
});

/*

Test URLs:

1. Visit https://github.com/notifications
2. Open any notification
3. Alt-ckick the buttons in the notification bar

*/
