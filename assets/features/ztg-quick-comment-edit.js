import React from '../npm/ztg-dom-chef.js';
import { hasComments, isLoggedIn } from '../npm/ztg-github-url-detection.js';
import memoize from '../npm/ztg-memoize.js';
import PencilIcon from '../npm/ztg-octicons-plain-react-components-Pencil.js';
import { elementExists, $, closestElement } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import { userIsModerator } from '../github-helpers/ztg-get-user-permission.js';
import { isArchivedRepoAsync } from '../github-helpers/ztg-index.js';
import withMenuOpen from '../github-helpers/ztg-with-menu-open.js';
import onElementRemoval from '../helpers/ztg-on-element-removal.js';
import observe from '../helpers/ztg-selector-observer.js';
import { withTooltipRef } from '../components/ztg-tooltip.js';

// The signal is only used to memoize calls on the current page. A new page load will use a new signal.
const isConversationIneditable = memoize(
	async (_signal) =>
		elementExists([
			'[class*="ReadonlyCommentBox-module"]',
			// If .js-pick-reaction is the first child, `reaction-menu` doesn't exist, which means that the conversation is locked.
			// However, if you can edit every comment, you can still edit the comment
			'.js-pick-reaction:first-child',
		]) && !await userIsModerator(),
	{
		cache: new WeakMap(),
	},
);

const editMenuItemSelector = 'li[data-component="ActionList.Item"]:has(.octicon-pencil)';

async function addQuickEditButton(menuButton, {signal}) {
	if (await isConversationIneditable(signal)) {
		features.unload(import.meta.url);
		return;
	}

	const editButton = (
		React.createElement('button', {
			ref: withTooltipRef('Edit comment'),
			type: "button",
			className: "Button Button--iconOnly Button--invisible Button--small"   ,
			onClick: async () =>
				withMenuOpen(menuButton, menu => {
					$(editMenuItemSelector, menu).click();
				}),}

, React.createElement(PencilIcon, null )
)
	);
	menuButton.before(editButton);

	// Remove our edit button when entering editing mode in case React doesn't, preventing duplicate buttons where only one works
	await onElementRemoval(menuButton, signal);
	editButton.remove();
}

async function addQuickEditButtonLegacy(commentDropdown, {signal}) {
	if (await isConversationIneditable(signal)) {
		features.unload(import.meta.url);
		return;
	}

	const commentBody = closestElement('.js-comment', commentDropdown);

	// The comment is definitely not editable
	if (!elementExists('.js-comment-update', commentBody)) {
		return;
	}

	// We can't rely on `observe` for deduplication because the anchor might be replaced by GitHub while leaving the edit button behind #5572
	if (elementExists('.rgh-quick-comment-edit-button', commentBody)) {
		return;
	}

	commentDropdown.before(
		React.createElement('button', {
			type: "button",
			role: "menuitem",
			className: "timeline-comment-action btn-link js-comment-edit-button rgh-quick-comment-edit-button"   ,
			'aria-label': "Edit comment" ,}

, React.createElement(PencilIcon, null )
),
	);
}

async function init(signal) {
	if (await isArchivedRepoAsync()) {
		return;
	}

	const isUserModerator = await userIsModerator();

	observe(
		// Scoped to comment headers; a bare kebab-button selector also matches unrelated menus like the PR checks section #9771
		'div:is([class^="IssueBodyHeader"], [data-testid="comment-header"])'
		+ (isUserModerator ? '' : '[class*="viewerDidAuthor" i]')
		+ ' '
		+ 'button[data-component="IconButton"]:has(> .octicon-kebab-horizontal)',
		addQuickEditButton,
		{signal},
	);

	observe(
		(isUserModerator ? '' : '.current-user')
		+ '.js-comment.unminimized-comment .timeline-comment-actions details.position-relative',
		addQuickEditButtonLegacy,
		{signal},
	);
}

void features.add(import.meta.url, {
	asLongAs: [
		isLoggedIn,
	],
	include: [
		hasComments,
	],
	init,
});

/*
Test URLs:

- Regular issue: https://github.com/es-tooling/module-replacements-codemods/issues/6
- Locked issue (own repo): https://github.com/refined-github/sandbox/issues/74
- Locked issue (other repo): https://github.com/eslint/eslint/issues/8213
- Archived repo: https://github.com/fregante/iphone-inline-video/issues/101

*/
