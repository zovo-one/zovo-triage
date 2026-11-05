import delegate from '../npm/ztg-delegate-it-delegate.js';
import { isClosedConversation, isPRFiles, isPRCommit } from '../npm/ztg-github-url-detection.js';
import { elementExists, closestElement, $, $optional } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import { getBranches } from '../github-helpers/ztg-pr-branches.js';
import { frame } from '../helpers/ztg-dom-utils.js';
import observe from '../helpers/ztg-selector-observer.js';

/** Rebuilds the "View file" link to point to the head repo and its branch instead of the base repo and the commit */
function rebuildFileLink(viewFileLink, filePath) {
	const {owner, name, branch} = getBranches().head;

	// Do not replace with `GitHubFileURL` #3152 #3111 #2595
	viewFileLink.pathname = [owner, name, 'blob', branch, ...filePath.split('/')]
		.map(part => encodeURIComponent(part)) // Path can contain special chars: #8473
		.join('/');
}

function isDeletedFile(fileHeader) {
	const diffLink = $('a', fileHeader);
	const diffInFileTree = $(`li[class*="file-tree-row"]:has([href="${diffLink.hash}"])`);
	return elementExists('.octicon-file-removed', diffInFileTree);
}

function getFilePath(fileHeader) {
	const fileNameElement = $('[class*="file-name"] code', fileHeader);
	const renamedTooltip = $optional('span.sr-only', fileNameElement);
	return (
		// Tooltip doesn't exist if the file wasn't renamed
		renamedTooltip?.textContent.split(' renamed to ', 2)[1]
		?? fileNameElement.textContent
	).replaceAll(/\u{200E}|\u{200F}/gu, '').trim();
}

async function handleMenuOpening({delegateTarget: menuButton}) {
	// Don't run if the menu has been closed
	// Check inverted value because `capture: true` makes this run before handler that toggle state
	if (menuButton.ariaExpanded === 'true') {
		return;
	}

	const fileHeader = closestElement('[class*="diff-file-header"]', menuButton);
	if (isDeletedFile(fileHeader)) {
		return;
	}

	const filePath = getFilePath(fileHeader);

	// Wait for the menu DOM to be created, but not rendered
	await frame();

	const viewFile = $('a[class^="prc-ActionList-ActionListContent"]:has(.octicon-eye)');
	rebuildFileLink(viewFile, filePath);
}

// TODO [2027-01-01]: Drop after legacy PR files view is removed
function alter(viewFileLink) {
	const filePath = closestElement('[data-path]', viewFileLink).getAttribute('data-path');
	rebuildFileLink(viewFileLink, filePath);
}

function init(signal) {
	delegate(
		'div[class^="DiffFileHeader-module__diff-file-header"] button:has(>.octicon-kebab-horizontal)',
		'click',
		handleMenuOpening,
		// `capture: true` to run before `more-file-links`
		{capture: true, signal},
	);

	// TODO [2027-01-01]: Drop after legacy PR files view is removed
	observe(
		'.file-header:not([data-file-deleted="true"]) a.dropdown-item[data-ga-click^="View file"]',
		alter,
		{signal},
	);
}

void features.add(import.meta.url, {
	include: [
		isPRFiles,
	],
	exclude: [
		// Editing files doesn't make sense after a PR is closed/merged
		isClosedConversation,
		// If you're viewing changes from partial commits, ensure you're on the latest one.
		() => isPRCommit() && !elementExists('[aria-label="No next commit"]'),
		// TODO [2027-01-01]: Drop after legacy PR files view is removed
		() => elementExists('.js-commits-filtered') && !elementExists('[aria-label="You are viewing the latest commit"]'),
	],
	awaitDomReady: true, // DOM-based filters, feature is invisible and inactive until dropdown is opened
	init,
});

/*

Test URLs

- PR: https://github.com/refined-github/sandbox/pull/4/changes
- deleted head repository: https://github.com/refined-github/refined-github/pull/271/changes
- File with brackets in the path: https://github.com/refined-github/sandbox/pull/114/changes
- Renamed and deleted files: https://github.com/refined-github/sandbox/pull/132/changes
*/
