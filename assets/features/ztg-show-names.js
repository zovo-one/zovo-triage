import batchedFunction from '../npm/ztg-batched-function.js';
import React from '../npm/ztg-dom-chef.js';
import { isFeed, hasComments } from '../npm/ztg-github-url-detection.js';
import { closestElementOptional } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import api from '../github-helpers/ztg-api.js';
import { getLoggedInUser, isUsernameAlreadyFullName } from '../github-helpers/ztg-index.js';
import { usernameLinksSelector } from '../github-helpers/ztg-selectors.js';
import attachElement from '../helpers/ztg-attach-element.js';
import { removeTextNodeContaining } from '../helpers/ztg-dom-utils.js';
import observe from '../helpers/ztg-selector-observer.js';

async function dropExtraCopy(link) {
	// Drop 'commented' label to shorten the copy
	const commentedNode = link.parentNode.nextSibling;
	if (commentedNode && closestElementOptional('.timeline-comment-header', link)) {
		// "left a comment" appears in the main comment of reviews
		removeTextNodeContaining(commentedNode, /commented|left a comment/);
	}
}

function createElement(element, fullName) {
	const nameElement = (
		React.createElement('span', { className: "color-fg-muted css-truncate d-inline-block no-wrap"   ,}
/* .css-truncate-target sets display: inline-block and confines bidi overrides #8191 */, "("
, React.createElement('span', { className: "css-truncate-target", style: {maxWidth: '200px'},}, fullName), ")"
)
	);

	if (
		element.matches([
			'.feed-item-content *',
			// PR event:
			//  - https://github.com/refined-github/refined-github/pull/8970#event-22710755292
			//  - https://github.com/refined-github/refined-github/pull/8970#event-22710646301
			// `readable-title-change-events` adds gap to rename events
			'.TimelineItem-body:not(:has(> del.markdown-title)) > *',
			// Reference event: https://github.com/refined-github/refined-github/pull/9041#ref-issue-4028015976
			'.TimelineItem-body > div > *',
		])
	) {
		nameElement.classList.add('ml-1');
	} else if (
		element.matches(
			// Issue event:
			//  - https://github.com/refined-github/sandbox/issues/3#event-5474574930
			//  - https://github.com/refined-github/sandbox/issues/3#event-10265481248
			// Username in issue events already has left margin
			// Rename events use `gap` for spacing
			'[class*="timelineBodyContent"]:not(:has(> [class*="RenamedTitleEvent"])) *',
		)
	) {
		nameElement.classList.add('mr-1');
	}

	return nameElement;
}

function appendName(element, fullName) {
	// If it's a regular comment author, add it outside <strong> otherwise it's something like "User added some commits"
	const {parentElement} = element;
	const insertionPoint = parentElement.tagName === 'STRONG' ? parentElement : element;

	// React might create a new label without removing the old one
	// https://github.com/refined-github/refined-github/issues/8478
	attachElement(insertionPoint, {after: () => createElement(element, fullName)});
}

async function updateLinks(found) {
	const users = Map.groupBy(
		// Exclude nested items https://github.com/refined-github/refined-github/pull/8661
		found.filter(element => element.textContent.trim() === element.href.split('/').pop()),
		element => element.textContent.trim(),
	);
	const currentUser = getLoggedInUser();
	const currentUserElements = users.get(currentUser);
	if (currentUserElements) {
		users.delete(currentUser);
	}

	users.delete('ghost'); // Consider using `github-reserved-names` if more exclusions are needed

	if (users.size === 0) {
		return;
	}

	const names = await api.v4(
		[...users.keys()].map(username => api.escapeKey(username) + `: user(login: "${username}") { name }`).join(','),
	);

	for (const [username, elements] of users) {
		const userKey = api.escapeKey(username);
		const {name: fullName} = names[userKey];

		// Could be `null` if not set or empty string if consisting only of emojis
		const fullNameWithoutEmoji = fullName?.replaceAll(/\p{RGI_Emoji}/gv, '').trim();
		if (!fullNameWithoutEmoji) {
			continue;
		}

		for (const element of elements) {
			if (isUsernameAlreadyFullName(username, fullNameWithoutEmoji)) {
				element.textContent = fullNameWithoutEmoji;
			} else {
				appendName(element, fullNameWithoutEmoji);
			}
		}
	}
}

const updateLink = batchedFunction(updateLinks, {delay: 200});

function updateDom(link) {
	// `dropExtraCopy` is async so that errors in this part don't break the entire feature
	void dropExtraCopy(link);

	updateLink(link);
}

async function init(signal) {
	observe(usernameLinksSelector, updateDom, {signal});
}

void features.add(import.meta.url, {
	include: [
		isFeed,
		hasComments,
	],
	requiresToken: true,
	init,
});

/*

Test URLs:

- issue: https://github.com/isaacs/github/issues/297
- PR with reviews: https://github.com/rust-lang/rfcs/pull/2544
- mannequins: https://togithub.com/python/cpython/issues/67591
- feed: https://github.com/feed

Special cases:

- RTL: https://github.com/refined-github/refined-github/issues/8191
- Bidi override case 1: https://togithub.com/FortAwesome/Font-Awesome/issues/2465
- Bidi override case 2: https://togithub.com/w3c/webdriver/issues/385#issuecomment-598407238
- With emoji: https://github.com/typescript-eslint/tsgolint/pull/2

*/
