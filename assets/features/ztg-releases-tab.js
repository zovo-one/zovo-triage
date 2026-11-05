import { hasRepoHeader } from '../npm/ztg-github-url-detection.js';
import TagIcon from '../npm/ztg-octicons-plain-react-components-Tag.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { writable } from '../npm/ztg-svelte-store-shared.js';
import '../npm/ztg-webext-storage-cache.js';
import features from '../ztg-feature-manager.js';
import api from '../github-helpers/ztg-api.js';
import { registerHotkey } from '../github-helpers/ztg-hotkey.js';
import { cacheByRepo, buildRepoUrl, getRepo } from '../github-helpers/ztg-index.js';
import { addTab } from '../components/ztg-extensible-nav-store.js';
import onetime from '../helpers/ztg-onetime.js';
import GetReleasesCount from './ztg-releases-tab.gql.js';
import CachedFunction from '../npm/ztg-webext-storage-cache-cached-function.js';

async function fetchCounts(nameWithOwner) {
	const [owner, name] = nameWithOwner.split('/', 2);
	const {repository: {releases, tags}} = await api.v4(GetReleasesCount, {
		variables: {name, owner},
	});

	if (releases.totalCount) {
		return [releases.totalCount, 'Releases'];
	}

	if (tags.totalCount) {
		return [tags.totalCount, 'Tags'];
	}

	return [0];
}

const releasesCount = new CachedFunction('releases-count', {
	updater: fetchCounts,
	shouldRevalidate: cachedValue => typeof cachedValue === 'number',
	maxAge: {hours: 1},
	staleWhileRevalidate: {days: 3},
	cacheKey: cacheByRepo,
});

async function getReleasesCount() {
	const repo = getRepo().nameWithOwner;
	return releasesCount.get(repo);
}

async function doesRepoHaveAnyTags() {
	const [count] = await getReleasesCount();
	return count > 0;
}

async function addReleasesTabOnce() {
	const [count, type] = await getReleasesCount();
	if (!type) {
		return false;
	}

	const href = buildRepoUrl(type.toLowerCase());
	const {pathname} = new URL(href);

	addTab({
		id: 'rgh-releases',
		href,
		label: type,
		icon: TagIcon,
		counter: writable(count),
		selected: () => location.pathname === pathname,
	});
}

function init(signal) {
	registerHotkey('g r', buildRepoUrl('releases'), {signal});
}

void features.add(import.meta.url, {
	shortcuts: {
		'g r': 'Go to Releases',
	},
	include: [
		hasRepoHeader,
	],
	requiresToken: true,
	init: onetime(addReleasesTabOnce),
}, {
	include: [
		hasRepoHeader,
	],
	init,
});

/*

Test URLs:

Releases: https://github.com/refined-github/refined-github
Tags: https://github.com/python/cpython

*/

export { doesRepoHaveAnyTags };
