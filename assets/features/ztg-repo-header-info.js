import React from '../npm/ztg-dom-chef.js';
import { hasRepoHeader } from '../npm/ztg-github-url-detection.js';
import LockIcon from '../npm/ztg-octicons-plain-react-components-Lock.js';
import { elementExists, $ } from '../npm/ztg-select-dom.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { mount } from '../npm/ztg-svelte-internal-client-render.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import features from '../ztg-feature-manager.js';
import api from '../github-helpers/ztg-api.js';
import { isSmallDevice, appendBefore } from '../helpers/ztg-dom-utils.js';
import observe from '../helpers/ztg-selector-observer.js';
import GetRepoInfo from './ztg-repo-header-info.gql.js';
import Repo_header_info from './ztg-repo-header-info.svelte.js';
import { buildRepoUrl } from '../github-helpers/ztg-index.js';

async function getRepositoryInfo() {
	const {repository} = await api.v4(GetRepoInfo);

	let ciCommit;
	if (!repository.isEmpty && repository.defaultBranchRef) {
		// Check earlier commits just in case the last one is CI-generated and doesn't have checks
		for (const commit of repository.defaultBranchRef.target.history.nodes) {
			if (!commit.statusCheckRollup) {
				continue;
			}

			ciCommit = commit.oid;
			break;
		}
	}

	return {
		...repository,
		ciCommit,
		stargazerUrl: repository.viewerPermission === 'READ'
			? undefined // No access: https://github.com/refined-github/refined-github/issues/9964
			: buildRepoUrl('stargazers'),
	};
}

async function add(breadcrumbs) {
	const info = await getRepositoryInfo().finally(() => {
		// Show the breadcrumbs even if the request fails
		// https://github.com/refined-github/refined-github/issues/9986
		breadcrumbs.classList.add('rgh-repo-header-info-updated');
	});

	// GitHub may already show this icon natively, so we match its position
	// It's generally missing when it's forked and private
	if (info.isPrivate && !elementExists('.octicon-lock', breadcrumbs)) {
		const repoLink = $(':scope > li:last-child a', breadcrumbs);
		appendBefore(
			repoLink,
			'.octicon-repo-forked',
			React.createElement(LockIcon, { className: "mr-1 tmp-mr-1 v-align-middle"  , width: 12, height: 12,} ),
		);
	}

	if (info.forked) {
		// Only show the clickable button at larger resolutions. Default to the native one on smaller screens
		$('.octicon-repo-forked', breadcrumbs).classList.add('d-md-none');
	}

	mount(Repo_header_info, {
		target: breadcrumbs,
		props: {info},
	});
}

async function init(signal) {
	observe('.loaded .GlobalNav nav[data-component="Breadcrumbs"] ol', add, {signal});
}

void features.addCssFeature(import.meta.url);
void features.add(import.meta.url, {
	include: [
		hasRepoHeader,
	],
	exclude: [
		// Disable the feature entirely on small screens
		isSmallDevice,
	],
	// Not enabled due to https://github.com/refined-github/refined-github/issues/9986
	// requiresToken: true,
	init,
});

/*
Test URLs

- Regular: https://github.com/refined-github/refined-github
- Fork: https://github.com/134130/refined-github
- Private: https://github.com/refined-github/private
- Private fork: https://github.com/refined-github/private-fork
- CI: https://github.com/refined-github/refined-github
- No CI: https://github.com/fregante/.github
*/
