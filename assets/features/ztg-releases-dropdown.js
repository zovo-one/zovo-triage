import delegate from '../npm/ztg-delegate-it-delegate.js';
import React from '../npm/ztg-dom-chef.js';
import { isReleases } from '../npm/ztg-github-url-detection.js';
import '../npm/ztg-webext-storage-cache.js';
import features from '../ztg-feature-manager.js';
import api from '../github-helpers/ztg-api.js';
import { cacheByRepo, buildRepoUrl } from '../github-helpers/ztg-index.js';
import observe from '../helpers/ztg-selector-observer.js';
import GetReleases from './ztg-releases-dropdown.gql.js';
import CachedFunction from '../npm/ztg-webext-storage-cache-cached-function.js';

const releasesCache = new CachedFunction('releases', {
	async updater() {
		const {repository} = await api.v4(GetReleases);
		return repository.releases.nodes.map(({tagName}) => tagName);
	},
	maxAge: {hours: 1},
	staleWhileRevalidate: {days: 4},
	cacheKey: cacheByRepo,
});

// `datalist` selections don't have an `inputType`
async function selectionHandler(event) {
	const field = event.delegateTarget;
	const selectedTag = field.value;
	if (selectedTag === 'prerelease:false') {
		location.assign('?q=prerelease%3Afalse');
		return;
	}

	const releases = await releasesCache.get(); // Expected to be in cache
	if (!('inputType' in event) && releases.includes(selectedTag)) {
		location.assign(buildRepoUrl('releases/tag', encodeURIComponent(selectedTag)));
		field.value = ''; // Can't call `preventDefault`, the `input` event is not cancelable
	}
}

async function addList(searchField) {
	const releases = await releasesCache.get();
	if (releases.length === 0) {
		return;
	}

	// `q` is only present in searches
	const hidePreReleases = new URLSearchParams(location.search).get('q')?.includes('prerelease:false');

	searchField.setAttribute('list', 'rgh-releases-dropdown');
	searchField.after(
		React.createElement('datalist', { id: "rgh-releases-dropdown",}
, React.createElement('option', {
				value: "prerelease:false",
				selected: hidePreReleases,}
			)
, releases.map(tag => React.createElement('option', { value: tag,} ))
),
	);
}

const searchFieldSelector = 'input#release-filter';
async function init(signal) {
	observe(searchFieldSelector, addList, {signal});
	delegate(searchFieldSelector, 'input', selectionHandler, {signal});
}

void features.add(import.meta.url, {
	include: [
		isReleases,
	],
	requiresToken: true,
	init,
});

/*

## Test URLs

https://github.com/refined-github/sandbox/releases

*/
