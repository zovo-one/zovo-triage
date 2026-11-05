import elementReady from '../npm/ztg-element-ready.js';
import { utils, isArchivedRepo, isRepoCommitList, isPR } from '../npm/ztg-github-url-detection.js';
import memoize from '../npm/ztg-memoize.js';
import { elementExists, closestElementOptional, $optional, $, closestElement } from '../npm/ztg-select-dom.js';
import compareVersions from '../npm/ztg-tiny-version-compare.js';
import { is } from '../helpers/ztg-css-selectors.js';
import getCommentAuthor from './ztg-get-comment-author.js';
import { branchSelector } from './ztg-selectors.js';
import { assert } from '../npm/ztg-ts-extras-assert.js';

// Re-export for convenience
const {getRepositoryInfo: getRepo, getCleanPathname, getLoggedInUser} = utils;

function getConversationNumber() {
	const [, _owner, _repo, type, prNumber] = location.pathname.split('/', 5);
	return (type === 'pull' || type === 'issues') && Number(prNumber) ? Number(prNumber) : undefined;
}

const isMac = navigator.userAgent.includes('Macintosh');

function buildRepoUrl(
	...pathParts
) {
	for (const part of pathParts) {
		if (typeof part === 'string' && /^\/|\/$/.test(part)) {
			throw new TypeError('The path parts shouldn’t start or end with a slash: ' + part);
		}
	}

	return [location.origin, getRepo()?.nameWithOwner, ...pathParts].join('/');
}

function getForkedRepo() {
	return $optional('meta[name="octolytics-dimension-repository_parent_nwo"]')?.content 

;
}

function parseTag(tag) {
	const {namespace = '', version = ''} = /(?:(?<namespace>.*)@)?(?<version>[^@]+)/.exec(tag)?.groups ?? {};
	return {namespace, version};
}

function isUsernameAlreadyFullName(username, realname) {
	// Normalize both strings
	username = username
		.replaceAll('-', '')
		.toLowerCase();
	realname = realname
		.normalize('NFD')
		// Remove diacritics, punctuation and spaces
		// https://stackoverflow.com/a/37511463/288906
		// https://www.freecodecamp.org/news/what-is-punct-in-regex-how-to-match-all-punctuation-marks-in-regular-expressions/
		.replaceAll(/[\s\p{Diacritic}\p{Punctuation}]/gu, '')
		.toLowerCase();

	return username === realname;
}

const validVersion = /^[rv]?\d+(?:\.\d+)+/;
const isPrerelease = /^[rv]?\d+(?:\.\d+)+-\d/;
function getLatestVersionTag(tags) {
	// Some tags aren't valid versions; comparison is meaningless.
	// Just use the latest tag returned by the API (reverse chronologically-sorted list)
	if (tags.some(tag => !validVersion.test(tag))) {
		return tags[0];
	}

	// Exclude pre-releases
	let releases = tags.filter(tag => !isPrerelease.test(tag));
	if (releases.length === 0) { // They were all pre-releases; undo.
		releases = tags;
	}

	let latestVersion = releases[0];
	for (const release of releases) {
		if (compareVersions(latestVersion, release) < 0) {
			latestVersion = release;
		}
	}

	return latestVersion;
}

// https://github.com/idimetrix/text-case/blob/master/packages/upper-case-first/src/index.ts
function upperCaseFirst(input) {
	return input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
}

const cachePerPage = {
	cacheKey: () => location.pathname,
};

/** Is tag or commit, with elementReady */
const isPermalink = memoize(async () => {
	// No need for getCurrentGitRef(), it's a simple and exact check
	if (/^[\da-f]{40}$/.test(location.pathname.split('/', 5)[4])) {
		// It's a commit
		return true;
	}

	// Awaiting only the branch selector means it resolves early even if the icon tag doesn't exist, whereas awaiting the icon tag would wait for the DOM ready event before resolving.
	return elementExists(
		'.octicon-tag', // Tags have an icon
		await elementReady(branchSelector),
	);
}, cachePerPage);

function isRefinedGitHubRepo() {
	return location.pathname.startsWith('/refined-github/refined-github');
}

function isAnyRefinedGitHubRepo() {
	return /^\/refined-github\/.+/.test(location.pathname);
}

function isRefinedGitHubYoloRepo() {
	return location.pathname.startsWith('/refined-github/yolo');
}

async function isArchivedRepoAsync() {
	// Load the bare minimum for `isArchivedRepo` to work
	await elementReady('main > div');

	// DOM-based detection, we want awaitDomReady: false, so it needs to be here
	return isArchivedRepo();
}

const userCanLikelyMergePr = () => elementExists('.discussion-sidebar-item .octicon-lock');

const navigationBarSelector = is(
	'.GlobalNav',
	// Remove after June 2026
	'.js-repo-nav',
);

function areIssuesEnabled() {
	const repo = getRepo();
	return elementExists(`${navigationBarSelector} a[href^="/${repo.nameWithOwner}/issues"]`);
}

function areDiscussionsEnabled() {
	const repo = getRepo();
	return elementExists(`${navigationBarSelector} a[href^="/${repo.nameWithOwner}/discussions"]`);
}

const cacheByRepo = () => getRepo().nameWithOwner;

// Commit lists for files and folders lack a branch selector
const isRepoCommitListRoot = () =>
	isRepoCommitList() && document.title.startsWith('Commits');

const isUrlReachable = memoize(async (url) => {
	const {ok: isOk} = await fetch(url, {method: 'head'});
	return isOk;
});

// Don't make the argument optional, sometimes we really expect it to exist and want to throw an error
function extractCurrentBranchFromBranchPicker(branchPicker) {
	return branchPicker.title === 'Switch branches or tags'
		? branchPicker.textContent.trim() // Branch name is shown in full
		: branchPicker.title; // Branch name was clipped, so they placed it in the title attribute
}

function addAfterBranchSelector(branchSelectorParent, sibling) {
	const row = closestElement('.position-relative', branchSelectorParent);
	row.classList.add('d-flex', 'flex-shrink-0', 'gap-2');
	row.append(sibling);
}

/** Trigger a conversation update if the view is out of date */
// https://github.com/refined-github/refined-github/issues/2465#issuecomment-567173300
function triggerConversationUpdate() {
	const marker = $('.js-timeline-marker');
	marker.dispatchEvent(
		new CustomEvent('socket:message', {
			bubbles: true,
			detail: {data: {gid: marker.dataset.gid}},
		}),
	);
}

// Fix z-index issue https://github.com/refined-github/refined-github/pull/7430
function fixFileHeaderOverlap(child) {
	// In the sidebar the container is not present and this fix is not needed
	closestElementOptional('.container', child)?.classList.add('rgh-z-index-5');
}

function multilineAriaLabel(...lines) {
	return lines.join('\n');
}

function scrollIntoViewIfNeeded(element) {
	// @ts-expect-error No Firefox support https://developer.mozilla.org/docs/Web/API/Element/scrollIntoViewIfNeeded
	(element.scrollIntoViewIfNeeded ?? element.scrollIntoView).call(element);
}

function getConversationBody() {
	return $([
		'.react-issue-body', // Issues
		'.js-command-palette-pull-body', // PRs
	]);
}

// Issues don't include the author in the title. PRs don't have a "conversation body" on the Files tab.
const prTitleExtractionRegex = /\bby (?<author>[^·]+?) · Pull Request #\d+ · [^/\\]+\/[^/\\]+$/;
function getConversationAuthor() {
	if (isPR()) {
		const match = prTitleExtractionRegex.exec(document.title);
		assert(match, `Failed to extract PR author from title: ${document.title}`);
		return match.groups.author;
	}

	return getCommentAuthor(getConversationBody());
}

function isOwnConversation() {
	return getConversationAuthor() === getLoggedInUser();
}

function assertCommitHash(hash) {
	if (!/^[0-9a-f]{40}$/.test(hash)) {
		throw new Error(`Invalid commit hash: ${hash}`);
	}
}

/** Use instead of location.assign() */
function visitAjaxedPage(url) {
	const anchor = document.createElement('a');
	anchor.setAttribute('data-turbo-frame', 'repo-content-turbo-frame');
	anchor.href = url;
	document.body.append(anchor);
	anchor.click();
	anchor.remove();
}

/** Can be used to close modals or popovers */
function pressEscapeKey() {
	document.body.dispatchEvent(
		new KeyboardEvent('keydown', {
			key: 'Escape',
			code: 'Escape',
			keyCode: 27,
			which: 27,
			bubbles: true,
			cancelable: true,
		}),
	);
}

export { addAfterBranchSelector, areDiscussionsEnabled, areIssuesEnabled, assertCommitHash, buildRepoUrl, cacheByRepo, extractCurrentBranchFromBranchPicker, fixFileHeaderOverlap, getCleanPathname, getConversationAuthor, getConversationBody, getConversationNumber, getForkedRepo, getLatestVersionTag, getLoggedInUser, getRepo, isAnyRefinedGitHubRepo, isArchivedRepoAsync, isMac, isOwnConversation, isPermalink, isRefinedGitHubRepo, isRefinedGitHubYoloRepo, isRepoCommitListRoot, isUrlReachable, isUsernameAlreadyFullName, multilineAriaLabel, parseTag, pressEscapeKey, scrollIntoViewIfNeeded, triggerConversationUpdate, upperCaseFirst, userCanLikelyMergePr, visitAjaxedPage };
