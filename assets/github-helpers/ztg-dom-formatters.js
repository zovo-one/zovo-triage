import React from '../npm/ztg-dom-chef.js';
import { linkifyIssuesToDom } from '../npm/ztg-linkify-issues.js';
import { linkifyUrlsToDom } from '../npm/ztg-linkify-urls.js';
import { closestElementOptional, elementExists } from '../npm/ztg-select-dom.js';
import { applyToLink } from '../npm/ztg-shorten-repo-url.js';
import zipTextNodes from '../_virtual/ztg-index2.js';
import getTextNodes from '../helpers/ztg-get-text-nodes.js';
import { getConversationNumber, buildRepoUrl } from './ztg-index.js';
import parseBackticks$1 from './ztg-parse-backticks.js';

// Shared class necessary to avoid also shortening the links
const linkifiedUrlClass = 'rgh-linkified-code';
const linkifiedUrlSelector = '.rgh-linkified-code';

const codeElementsSelector = [
	// Sometimes formatted diffs are loaded later and discard our formatting #5870
	'.blob-code-inner:not(deferred-diff-lines.awaiting-highlight *)', // Code lines
	':is(.snippet-clipboard-content, .highlight) > pre.notranslate', // Code blocks in comments. May be wrapped twice
	'.markdown-body code:not(a code, pre code)', // Inline code in comments
	'.diff-text-inner',
	'.react-file-line',
];

function shortenLink(link) {
	// Exclude the link if the closest element found is not `.markdown-body`
	// This avoids shortening links in code and code suggestions, but still shortens them in review comments
	// https://github.com/refined-github/refined-github/pull/4759#discussion_r702460890
	if (!closestElementOptional([...codeElementsSelector, '.markdown-body'], link)?.classList.contains('markdown-body')) {
		return;
	}

	applyToLink(link, location.href);

	// Customize same-thread links. Already handled by GitHub, but badly
	// https://github.com/refined-github/refined-github/issues/6057
	switch (link.textContent) {
		case `#${getConversationNumber()} (comment)`: {
			link.textContent = '(earlier comment)';
			break;
		}

		case `#${getConversationNumber()} (review)`: {
			link.textContent = '(earlier review)';
			break;
		}
	}
}

function linkifyIssues(
	currentRepo,
	element,
	options = {},
) {
	const linkified = linkifyIssuesToDom(element.textContent, {
		user: currentRepo.owner ?? '/',
		repository: currentRepo.name ?? '/',
		baseUrl: '',
		...options,
		attributes: {
			class: linkifiedUrlClass, // Necessary to avoid also shortening the links
			...options.attributes,
		},
	});
	if (linkified.children.length === 0) { // Children are <a>
		return;
	}

	// Enable native issue title fetch
	for (const link of linkified.children ) {
		const issue = link.href.split('/').pop();
		link.setAttribute('class', 'issue-link js-issue-link');
		link.dataset.errorText = 'Failed to load title';
		link.dataset.permissionText = 'Title is private';
		link.dataset.url = link.href;
		link.dataset.id = `rgh-issue-${issue}`;
		link.dataset.hovercardType = 'issue';
		link.dataset.hovercardUrl = `${link.pathname}/hovercard`;
	}

	zipTextNodes(element, linkified);
}

function linkifyUrls(element) {
	if (element.textContent.length < 15) { // Must be long enough for a URL
		return;
	}

	if (elementExists(linkifiedUrlSelector, element)) {
		console.warn('Links already exist', element);
		throw new Error('Links already exist');
	}

	const linkified = linkifyUrlsToDom(element.textContent, {
		attributes: {
			rel: 'noreferrer noopener',
			class: linkifiedUrlClass, // Necessary to avoid also shortening the links
		},
	});

	if (linkified.children.length === 0) { // Children are <a>
		return;
	}

	zipTextNodes(element, linkified);
}

function parseBackticks(element) {
	for (const node of getTextNodes(element)) {
		const fragment = parseBackticks$1(node.textContent);

		if (fragment.children.length > 0) {
			node.replaceWith(fragment);
		}
	}
}

function linkifyCommit(sha) {
	// Data attributes copied from the commit in https://github.com/refined-github/github-url-detection/releases/tag/v7.1.2
	return (
		React.createElement('code', null
, React.createElement('a', {
				className: "Link--secondary",
				href: buildRepoUrl('commit', sha),
				'data-hovercard-type': "commit",
				'data-hovercard-url': buildRepoUrl('commit', sha, 'hovercard'),}

, sha.slice(0, 7)
)
)
	);
}

export { codeElementsSelector, linkifiedUrlClass, linkifyCommit, linkifyIssues, linkifyUrls, parseBackticks, shortenLink };
