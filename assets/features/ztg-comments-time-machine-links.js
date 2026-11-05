import { clsx } from '../npm/ztg-clsx-clsx.js';
import delegate from '../npm/ztg-delegate-it-delegate.js';
import React from '../npm/ztg-dom-chef.js';
import elementReady from '../npm/ztg-element-ready.js';
import { isGist, hasComments, is404, isSingleFile, isRepoTree, isRepoGitObject } from '../npm/ztg-github-url-detection.js';
import HistoryIcon from '../npm/ztg-octicons-plain-react-components-History.js';
import { closestElementOptional, $, closestElement } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import api from '../github-helpers/ztg-api.js';
import { linkifiedUrlClass } from '../github-helpers/ztg-dom-formatters.js';
import getDefaultBranch from '../github-helpers/ztg-get-default-branch.js';
import GitHubFileUrl from '../github-helpers/ztg-github-file-url.js';
import { isPermalink, buildRepoUrl } from '../github-helpers/ztg-index.js';
import addNotice from '../github-helpers/ztg-notice-bar.js';
import { is } from '../helpers/ztg-css-selectors.js';
import observe from '../helpers/ztg-selector-observer.js';
import GetCommitAtDate from './ztg-comments-time-machine-links.gql.js';
import { saveOriginalHref } from './ztg-last-update-sort.js';

const commentSelector = is(
	'.loaded .react-issue-body', // Issue description
	'.react-issue-comment', // Issue comment
	'[data-testid="review-thread"] > div', // Review thread comment
	'.js-comment', // PR description or comment
);

async function updateUrltoDatedSha(url, date) {
	const {repository} = await api.v4(GetCommitAtDate, {variables: {date, branch: url.branch}});

	const [{oid}] = repository.ref.target.history.nodes;
	$('a.rgh-link-date').pathname = url.assign({branch: oid}).pathname;
}

async function showTimeMachineBar() {
	const url = new URL(location.href); // This can't be replaced with `GitHubFileURL` because `getCurrentGitRef` throws on 404s
	const date = url.searchParams.get('rgh-link-date');

	// Drop parameter from current page after using it
	url.searchParams.delete('rgh-link-date');
	history.replaceState(history.state, document.title, url.href);

	if (is404()) {
		const pathnameParts = url.pathname.split('/');
		pathnameParts[4] = `HEAD@{${date}}`;
		url.pathname = pathnameParts.join('/');
	} else {
		// This feature only makes sense if the URL points to a non-permalink
		if (await isPermalink()) {
			return false;
		}

		const lastCommitDate = await elementReady(
			'div[data-testid="latest-commit-details"] relative-time',
			{waitForChildren: false},
		);
		if (lastCommitDate && date > lastCommitDate.getAttribute('datetime')) {
			return false;
		}

		const parsedUrl = new GitHubFileUrl(location.href);

		// Handle `isRepoHome` #4979
		parsedUrl.branch ||= await getDefaultBranch();
		parsedUrl.route ||= 'tree';

		// Due to GitHub’s bug of supporting branches with slashes: #2901
		void updateUrltoDatedSha(parsedUrl, date); // Don't await it, since the link will usually work without the update

		// Set temporary URL AFTER calling `updateURLtoDatedSha`
		parsedUrl.branch = `${parsedUrl.branch}@{${date}}`;

		// Use new path in link
		url.pathname = parsedUrl.pathname;
	}

	const link = (
		React.createElement('a', { className: "rgh-link-date", href: url.href,}, "view this object as it appeared at the time of the comment"

)
	);
	await addNotice(
		React.createElement(React.Fragment, null, "You can also "
   , link, " (" , React.createElement('relative-time', { datetime: date,} ), ")"
),
	);
}

function addDateParameterToLink(link) {
	if (!isRepoGitObject(link)) {
		return;
	}

	// Skip links that already have a date parameter #9177
	const searchParameters = new URLSearchParams(link.search);
	if (searchParameters.has('rgh-link-date')) {
		return;
	}

	// Skip permalinks
	const linkParts = link.pathname.split('/');
	if (/^[\da-f]{40}$/.test(linkParts[4])) {
		return;
	}

	const comment = closestElement(commentSelector, link);
	const relativeTime = $('relative-time', comment);
	const timestamp = relativeTime.attributes.datetime.value;

	saveOriginalHref(link);

	searchParameters.set('rgh-link-date', timestamp);
	link.search = String(searchParameters);
}

function addDropdownLink(menu, timestamp) {
	$('.show-more-popover', menu.parentElement).append(
		React.createElement('div', { className: "dropdown-divider",} ),
		React.createElement('a', {
			href: buildRepoUrl(`tree/HEAD@{${timestamp}}`),
			className: clsx('dropdown-item btn-link', linkifiedUrlClass),
			role: "menuitem",
			title: "Browse repository like it appeared on this day"       ,}
, "View repo at this time"

),
	);
}

function addDropdownLinkReact({delegateTarget}) {
	const timestamp = $(
		'relative-time[datetime]',
		closestElement(commentSelector, delegateTarget),
	).attributes.datetime.value;
	const menuItemList = $('[class^="prc-ActionList-ActionList"]');
	const menuItem = $('[class^="prc-ActionList-ActionListItem"]', menuItemList).cloneNode(true);

	menuItem.removeAttribute('aria-keyshortcuts');
	menuItem.role = 'none';
	const menuItemContentWrapper = $('[class^="prc-ActionList-ActionListContent"]', menuItem);
	const link = (
		React.createElement('a', {
			href: buildRepoUrl(`tree/HEAD@{${timestamp}}`),
			className: clsx(menuItemContentWrapper.className, linkifiedUrlClass),
			role: "menuitem",
			title: "Browse repository like it appeared on this day"       ,
			'aria-keyshortcuts': "v",}

)
	);
	link.append(...menuItemContentWrapper.childNodes);
	menuItemContentWrapper.replaceWith(link);
	$('[class^="prc-ActionList-ItemLabel"]', menuItem).textContent = 'View repo at this time';
	$('[class^="prc-ActionList-LeadingVisual"]', menuItem).replaceChildren(React.createElement(HistoryIcon, null ));

	menuItemList.append(
		React.createElement('li', { className: "dropdown-divider", 'aria-hidden': "true", 'data-component': "ActionList.Divider",} ),
		menuItem,
	);
}

async function init(signal) {
	observe('.timeline-comment-actions > details:last-child', menu => {
		if (closestElementOptional('.js-pending-review-comment', menu)) {
			return;
		}

		// The timestamp of main review comments isn't in their header but in the timeline event above #5423
		const timestamp = $(
			'relative-time',
			closestElement([
				'.js-comment:not([id^="pullrequestreview-"])',
				'.js-timeline-item',
			], menu),
		)
			.attributes
			.datetime
			.value;

		addDropdownLink(menu, timestamp);
	}, {signal});

	// [data-component="IconButton"] includes only React buttons
	// :not([id^="task-list-menu"]) excludes task list (Convert to issue/sub-issue, etc) menu buttons
	delegate(
		`${commentSelector} button[data-component="IconButton"]:has(> .octicon-kebab-horizontal):not([id^="task-list-menu"])`,
		'click',
		addDropdownLinkReact,
		{signal},
	);

	observe(
		`${commentSelector} a[href^="${location.origin}"]:not(.${linkifiedUrlClass})`,
		addDateParameterToLink,
		{signal},
	);
}

void features.add(import.meta.url, {
	include: [
		hasComments,
	],
	exclude: [
		isGist,
	],
	requiresToken: true,
	init,
}, {
	asLongAs: [
		() => new URLSearchParams(location.search).has('rgh-link-date'),
	],
	include: [
		is404,
		isSingleFile,
		isRepoTree,
	],
	init: showTimeMachineBar,
});

/*
Test URLs

https://github.com/refined-github/refined-github/pull/1863
https://github.com/refined-github/sandbox/issues/108

See the bar on:

- https://github.com/sindresorhus/refined-github/blob/main/source/features/mark-merge-commits-in-list.tsx?rgh-link-date=2019-03-04T13%3A04%3A18Z
*/
