import React from '../npm/ztg-dom-chef.js';
import { isSingleFile, isEditingFile } from '../npm/ztg-github-url-detection.js';
import AlertIcon from '../npm/ztg-octicons-plain-react-components-Alert.js';
import GitPullRequestIcon from '../npm/ztg-octicons-plain-react-components-GitPullRequest.js';
import '../npm/ztg-webext-storage-cache.js';
import features from '../ztg-feature-manager.js';
import api from '../github-helpers/ztg-api.js';
import getDefaultBranch from '../github-helpers/ztg-get-default-branch.js';
import GitHubFileUrl from '../github-helpers/ztg-github-file-url.js';
import { cacheByRepo, buildRepoUrl } from '../github-helpers/ztg-index.js';
import observe from '../helpers/ztg-selector-observer.js';
import listPrsForFileQuery from './ztg-list-prs-for-file.gql.js';
import CachedFunction from '../npm/ztg-webext-storage-cache-cached-function.js';

function getPrUrl(prNumber) {
	const hash = `#:~:text=${new GitHubFileUrl(location.href).filePath}`;
	return buildRepoUrl('pull', prNumber, 'files') + hash;
}

function getHovercardUrl(prNumber) {
	return buildRepoUrl('pull', prNumber, 'hovercard');
}

const buttonId = 'rgh-list-prs-for-file-';
let count = 0;

function getDropdown(prs) {
	const isEditing = isEditingFile();
	const icon = isEditing
		? React.createElement(AlertIcon, { className: "color-fg-attention",} )
		: React.createElement(GitPullRequestIcon, null );

	count++;
	return (
		React.createElement('div', null
, React.createElement('button', {
				type: "button",
				className: "Button Button--secondary color-fg-muted"  ,
				id: buttonId + count,
				// @ts-expect-error HTML standard
				popovertarget: buttonId + 'popover-' + count,}

, icon
, React.createElement('span', { className: "color-fg-default",}, " " , prs.length, " " )
, React.createElement('div', { className: "dropdown-caret",} )
)

, React.createElement('anchored-position', {
				id: buttonId + 'popover-' + count,
				anchor: buttonId + count,
				popover: "auto",}

, React.createElement('div', { className: "Overlay Overlay--size-auto" ,}
, React.createElement('div', { className: "px-3 tmp-px-3 pt-3 tmp-pt-3 h6 color-fg-muted"     ,}, "File also being edited in"

)
, React.createElement('ul', { className: "ActionListWrap ActionListWrap--inset" ,}
, prs.map(prNumber => (
							React.createElement('li', { className: "ActionListItem",}
, React.createElement('a', {
									className: "ActionListContent js-hovercard-left" ,
									href: getPrUrl(prNumber),
									'data-hovercard-url': getHovercardUrl(prNumber),}
, "#"
, prNumber
)
)
						))
)
)
)
)
	);
}

/**
@returns prsByFile {"filename1": [10, 3], "filename2": [2]}
*/
const prsByFileCache = new CachedFunction('files-with-prs', {
	async updater() {
		const {repository} = await api.v4(listPrsForFileQuery, {
			variables: {
				defaultBranch: await getDefaultBranch(),
			},
		});

		const files = {};

		for (const pr of repository.pullRequests.nodes) {
			for (const {path} of pr.files.nodes) {
				files[path] ??= [];
				if (files[path].length < 10) {
					files[path].push(pr.number);
				}
			}
		}

		return files;
	},
	maxAge: {hours: 2},
	staleWhileRevalidate: {days: 9},
	cacheKey: cacheByRepo,
});

async function add(anchor) {
	const path = new GitHubFileUrl(location.href).filePath;
	const prsByFile = await prsByFileCache.get();
	let prs = prsByFile[path];

	if (!prs) {
		return;
	}

	// Only appears when editing files from PRs
	const editingPrNumber = new URLSearchParams(location.search).get('pr')?.split('/').slice(-1);
	if (editingPrNumber) {
		prs = prs.filter(pr => pr !== Number(editingPrNumber));
		if (prs.length === 0) {
			return;
		}
	}

	const dropdown = getDropdown(prs);
	if (anchor.parentElement.matches('.gap-2')) {
		// `isSingleFile`
		anchor.before(dropdown);
	} else {
		// `isEditingFile`
		dropdown.classList.add('mr-2');
		anchor.parentElement.prepend(dropdown);
	}
}

async function init(signal) {
	observe(
		[
			'[data-testid="more-file-actions-button-nav-menu-wide"]', // `isSingleFile`
			'[data-testid="more-file-actions-button-nav-menu-narrow"]', // `isSingleFile`
			'[data-hotkey="Mod+s"]', // `isEditingFile`
		],
		add,
		{signal},
	);
}

void features.add(import.meta.url, {
	include: [
		isSingleFile,
		isEditingFile,
	],
	requiresToken: true,
	init,
});

/*

## Test URLs

- isSingleFile: https://github.com/refined-github/sandbox/blob/6619/6619
- isEditingFile: https://github.com/refined-github/sandbox/edit/6619/6619

*/
