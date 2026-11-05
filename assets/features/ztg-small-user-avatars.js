import React from '../npm/ztg-dom-chef.js';
import { isNotifications } from '../npm/ztg-github-url-detection.js';
import features from '../ztg-feature-manager.js';
import getUserAvatar from '../github-helpers/ztg-get-user-avatar.js';
import { is, not } from '../helpers/ztg-css-selectors.js';
import { isSmallDevice } from '../helpers/ztg-dom-utils.js';
import onetime from '../helpers/ztg-onetime.js';
import observe from '../helpers/ztg-selector-observer.js';

function createAvatar(username, size) {
	return (
		React.createElement('img', {
			className: "avatar avatar-user rgh-small-user-avatars"  ,
			src: getUserAvatar(username, size),
			width: size,
			height: size,
			loading: "lazy",}
		)
	);
}

function addRepoAvatar(link) {
	const [owner] = link.textContent.trim().split('/', 1);

	link.firstElementChild.prepend(
		React.createElement('span', { className: "ActionListItem-visual ActionListItem-visual--leading d-none d-xl-inline-block"   ,}
, createAvatar(owner, 14)
),
	);
}

function addAvatar(link) {
	const username = link.textContent;
	const avatar = createAvatar(username, 14);
	avatar.classList.add('v-align-text-bottom', 'mr-1', 'tmp-mr-1');

	link.classList.add('d-inline-block', 'lh-condensed-ultra');
	link.prepend(avatar);
}

function addMentionAvatar(link) {
	// Don't use textContent #8389
	const username = link.href.split('/').pop();
	const avatarUrl = getUserAvatar(username, 16);

	link.classList.add('rgh-small-user-avatars', 'rgh-mention-avatar');
	link.style.setProperty('--avatar-url', `url(${avatarUrl})`);
}

function initOnce() {
	// Excludes bots
	observe([
		'.js-issue-row [data-hovercard-type="user"]', // `isPRList` + old `isIssueList`
		'.notification-thread-subscription [data-hovercard-type="user"]', // https://github.com/notifications/subscriptions
		is(
			'[data-testid="created-at"]',
			'[data-testid="closed-at"]',
		) + ' a[data-hovercard-url*="/users"]', // `isIssueList`
	], addAvatar);
	observe(
		'.user-mention' + not(
			'.opened-by > *', // Merge queue
			'.commit-author',
		),
		addMentionAvatar,
	);
}

function initNotifications(signal) {
	observe(
		'nav[aria-label="Repositories"] .ActionListItem[data-targets="nav-list.items"]', // Repos list in the left sidebar
		addRepoAvatar,
		{signal},
	);
}

void features.add(import.meta.url, {
	init: onetime(initOnce),
}, {
	include: [
		isNotifications,
	],
	exclude: [
		isSmallDevice,
	],
	init: initNotifications,
});

/*

Test URLs:

https://github.com/notifications/subscriptions
https://github.com/refined-github/refined-github/issues
https://github.com/refined-github/refined-github/pull/7004
https://github.com/refined-github/refined-github/issues/8802#issuecomment-3711163697
https://github.com/refined-github/refined-github/releases
https://github.com/refined-github/refined-github/releases/tag/23.9.21
https://github.com/orgs/community/discussions/5841#discussioncomment-1450320

*/
