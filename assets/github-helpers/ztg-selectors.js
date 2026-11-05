import { any } from '../npm/ztg-code-tag.js';
import { is, not } from '../helpers/ztg-css-selectors.js';

const standaloneGistLinkInMarkdown = `
	:is(.js-comment-body, .react-issue-comment, .react-issue-body) p a:only-child:is(
		[href^="https://gist.github.com/"],
		[href^="${location.origin}/gist/"]
	)
` ;

const branchSelector = [
	'#ref-picker-repos-header-ref-selector-wide', // `isSingleFile` with sidebar closed
	'#ref-picker-repos-header-ref-selector', // `isSingleFile` with sidebar open; `isRepoRoot`
	// TODO [2027-01-01]: Drop
	'[data-hotkey="w"]',
];

const branchSelectorParent = 'details#branch-select-menu';

// .color-fg-muted selects only files; some icon extensions use `img` tags
const directoryListingFileIcon =
	'.react-directory-filename-column > :is(svg, img):is(.color-fg-muted, .octicon-file-symlink-file)';

const openPrsListLink = [
	// `.color-fg-open` is needed because of the icon added by `highlight-non-default-base-branch`
	any`
		.js-issue-row:has(
			.octicon-git-pull-request.color-fg-open,
			.octicon-git-pull-request-draft
		) a.js-navigation-open
	`,
	// React view
	any`
		li[role="listitem"] h3 a[data-hovercard-url*="/pull"]
	`,
];

const commentsCountInLists = [
	// Issue list:
	'div[data-testid="list-row-comments"]:not(:empty)',
	'div[class^="PinnedIssue-module__commentCountContainer"]',

	// PR list
	// aria-label="1 comment"
	// aria-label="2 comments"
	'.js-issue-row a.Link--muted[aria-label*=" comment"]',
];

const paginationButtonSelector = '.ajax-pagination-form button.ajax-pagination-btn';

const codeSearchHeader = any`
	div:has(
		> [aria-label^="Collapse "],
		> [aria-label^="Expand "]
	)
`;

// Excludes /pulls/* and /issues/* global pages since they're already sorted by update time #9604
const linksToConversationLists = `
	a:is(
		[href*="/issues"],
		[href*="/pulls"],
		[href*="/projects"],
		[href*="/labels/"]
	):not(
		[href^="/pulls"],
		[href^="/issues"],

		[href*="/issues/labels"],
		[href*="/issues/views"],
		[href*="sort%3A"],
		[href*="page="],
		.issues-reset-query,
		.pagination *,
		.table-list-header-toggle *
	)
`;

const newCommentField = [
	// PR comment
	'file-attachment[input="fc-new_comment_field"]',

	// PR review comment, conversation tab
	'file-attachment[input^="fc-new_inline_comment_discussion"]',

	// PR Review comment, files tab
	'div[class*="AddCommentEditor"] textarea',

	// Issue comment
	'textarea[aria-labelledby="comment-composer-heading"]',
];

const legacyCommentField = 'textarea#new_comment_field';

const commitHashLinkInLists = [
	'[data-testid="commit-row-browse-repo"]', // `isCommitList`
	'a[id^="commit-details-"]', // `isPRCommitList`
	'.js-details-container .text-right code a.Link--secondary', // `isPRConversation`
] ;

const commitTitleInLists = [
	'[data-testid="commit-row-item"] h4[class^="Title-module"]', // `isCommitList`
	'.js-commits-list-item > .js-details-container > p:first-child', // `isCompare`
];

const botNames = [
	'actions-user',
	'bors',
	'ImgBotApp',
	'renovate-bot',
	'rust-highfive',
	'scala-steward',
	'weblate',
	'apps', // Matches any `/apps/*` URLs
	'github-apps', // GHE apps
] ;

const botAttributes = botNames.map(bot => `[href^="/${bot}"]`);

// All co-authored commits are excluded because it's unlikely that any bot co-authors with another bot, but instead they're co-authored with a human. In that case we don't want to dim the commit.
// ^= is needed to match /apps/* URLs
const botLinksCommitSelectors = [
	// Co-authored commits are excluded because their avatars are not linked
	'a[data-testid="avatar-icon-link"]' + is(botAttributes),

	// Legacy view, still used by PR commits
	// :only-child excludes co-authored commits
	'a[data-test-selector="commits-avatar-stack-avatar-link"]' + is(botAttributes) + ':only-child',
];

const botLinksPrSelectors = [
	...botNames.flatMap(bot => [
		`.opened-by [title$="pull requests created by ${bot}"]`,
		`.opened-by [title$="pull requests opened by ${bot}"]`,
	]),
	'.opened-by [href*="author%3Aapp%2F"]', // Search query `is:pr+author:app/*`
	'.labels [href$="label%3Abot"]', // PR tagged with `bot` label
];

const botLinksNotificationSelectors = [
	// Only select if the bot is the primary author (last in DOM, first in avatar list)
	'.AvatarStack-body a.avatar:last-child' + is(botAttributes),
];

// `a` selector needed to skip commits by non-GitHub users
const authorLinks = [
	// Old views
	'.js-discussion a.author',
	'.inline-comments a.author',
	// React-based views
	'[data-testid="comment-header"] a[data-testid="avatar-link"]',
	'a[data-testid="issue-body-header-author"]',
	'a[class^="row-module__eventActorLink"]',
] ;

const authorLinksException = [
	// # targets mannequins #6504
	'[href="#"]',
	'[href*="/apps/"]',
	'[href*="/marketplace/"]',
	'[data-hovercard-type="organization"]',
	// For GHE: https://github.com/refined-github/refined-github/issues/7232#issuecomment-1910803157
	'[show_full_name="true"]',
] ;

const usernameLinksSelector = [
	is(authorLinks) + not(authorLinksException),

	// On dashboard
	// `.Link--primary` excludes avatars
	// [aria-label="card content"] excludes links in cards #6530 #6915
	'#dashboard a.Link--primary[data-hovercard-type="user"]:not([aria-label="card content"] *)',
	'.feed-item-content header a.Link--primary',
] ;

const actionBar = [
	'[data-component="ActionBar"]', // React component
	'action-bar', // Still used in gists, PRs, etc
];

const prMergeabilityBoxCaption =
	'section[aria-label="Conflicts"] div[class^="MergeBoxSectionHeader-module__wrapper"] h3 + .fgColor-muted';

const deletedHeadRepository = 'span[title="This repository has been deleted"]';

const conversationCloseEvent = [
	// Old view (PRs)
	`.TimelineItem:has(.TimelineItem-badge :is(
		.octicon-issue-closed,
		.octicon-git-merge,
		.octicon-git-pull-request-closed,
		.octicon-skip
	))`,
	// React view (Issues)
	'[data-timeline-event-id]:has([data-testid="state-reason-link"])',
];

const confirmMergeButton = '[data-testid="mergebox-partial"] [class*="ConfirmMerge"] ~ div button:first-child';

/* NOTE: Must be a hash, not a generic selector */
const commentBoxHashPr = '#issue-comment-box';

/* NOTE: Must be a hash, not a generic selector */
const commentBoxHashIssue = '#react-issue-comment-composer';

export { actionBar, botLinksCommitSelectors, botLinksNotificationSelectors, botLinksPrSelectors, branchSelector, branchSelectorParent, codeSearchHeader, commentBoxHashIssue, commentBoxHashPr, commentsCountInLists, commitHashLinkInLists, commitTitleInLists, confirmMergeButton, conversationCloseEvent, deletedHeadRepository, directoryListingFileIcon, legacyCommentField, linksToConversationLists, newCommentField, openPrsListLink, paginationButtonSelector, prMergeabilityBoxCaption, standaloneGistLinkInMarkdown, usernameLinksSelector };
