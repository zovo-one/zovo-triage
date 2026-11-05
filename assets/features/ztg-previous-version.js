import React from '../npm/ztg-dom-chef.js';
import { isRepoRoot, isSingleFile, isRepoTree, isBlame } from '../npm/ztg-github-url-detection.js';
import VersionsIcon from '../npm/ztg-octicons-plain-react-components-Versions.js';
import { closestElementOptional, elementExists, $ } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import onReactPageUpdate from '../github-events/ztg-on-react-page-update.js';
import api from '../github-helpers/ztg-api.js';
import GitHubFileUrl from '../github-helpers/ztg-github-file-url.js';
import observe from '../helpers/ztg-selector-observer.js';
import previousVersionQuery from './ztg-previous-version.gql.js';

async function getPreviousCommitForFile(pathname) {
	const {user, repository, branch, filePath} = new GitHubFileUrl(pathname);
	const {resource} = await api.v4(previousVersionQuery, {
		variables: {
			filePath,
			resource: `/${user}/${repository}/commit/${branch}`,
		},
	});

	// The first commit refers to the current one, so we skip it
	return resource.history.nodes[1]?.oid;
}

async function getPreviousFileUrl() {
	const previousCommit = await getPreviousCommitForFile(location.href);
	if (!previousCommit) {
		return;
	}

	return new GitHubFileUrl(location.href)
		.assign({branch: previousCommit})
		.href;
}

function addMobileDom(wrappedHistoryButton) {
	const wrappedPreviousButton = wrappedHistoryButton.cloneNode(true);
	wrappedPreviousButton.setAttribute('aria-label', 'Previous version');
	const previousButton = $('a', wrappedPreviousButton);
	previousButton.classList.add('rgh-previous-version-mobile');
	wrappedHistoryButton.before(wrappedPreviousButton);
	return previousButton;
}

function addDesktopDom(historyButton) {
	const previousButton = historyButton.cloneNode(true);
	previousButton.classList.add('mr-n2', 'rgh-previous-version-desktop');
	$('span[data-component="text"]', previousButton).textContent = 'Previous';
	historyButton.before(previousButton);
	return previousButton;
}

async function add(historyButton, {signal}) {
	const url = await getPreviousFileUrl();
	if (!url) {
		return;
	}

	// The button might be labeled or inside a role="tooltip" element.
	// If it has a tooltip, we need to clone the tooltip element itself, not the button.
	const wrappedHistoryButton = closestElementOptional('[role="tooltip"]', historyButton);

	if (elementExists(wrappedHistoryButton ? '.rgh-previous-version-mobile' : '.rgh-previous-version-desktop')) {
		return;
	}

	const previousButton = wrappedHistoryButton
		? addMobileDom(wrappedHistoryButton)
		: addDesktopDom(historyButton);

	previousButton.href = url;
	$('span[data-component="leadingVisual"] svg', previousButton).replaceWith(
		React.createElement(VersionsIcon, null ),
	);

	onReactPageUpdate(async pageUnload => {
		if (pageUnload.aborted) {
			return;
		}

		const previousFileUrl = await getPreviousFileUrl();
		if (previousFileUrl) {
			previousButton.href = previousFileUrl;
		}

		previousButton.hidden = !url;
	}, signal);
}

async function init(signal) {
	observe('a:has([data-component="leadingVisual"] svg.octicon-history)', add, {signal});
}

void features.add(import.meta.url, {
	include: [
		isSingleFile,
		isRepoTree,
		isBlame,
	],
	exclude: [
		isRepoRoot,
	],
	requiresToken: true,
	init,
});

/*

Test URL

https://github.com/refined-github/refined-github/tree/main/source
https://github.com/refined-github/refined-github/blob/main/readme.md

*/
