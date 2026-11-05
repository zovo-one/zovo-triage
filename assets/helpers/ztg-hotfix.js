import { any } from '../npm/ztg-code-tag.js';
import React from '../npm/ztg-dom-chef.js';
import { isEnterprise } from '../npm/ztg-github-url-detection.js';
import '../npm/ztg-webext-storage-cache.js';
import { getNewFeatureName } from '../ztg-feature-data.js';
import isDevelopmentVersion from './ztg-is-development-version.js';
import { webextFetch } from './ztg-isomorphic-fetch.js';
import { parseBrokenFeaturesCsv } from './ztg-hotfix-parse.js';
import CachedFunction from '../npm/ztg-webext-storage-cache-cached-function.js';

const {version: currentVersion} = chrome.runtime.getManifest();

async function fetchHotfix(path) {
	// Use GitHub Pages host because the API is rate-limited
	return webextFetch(`https://refined-github.github.io/yolo/${path}`, {
		cache: 'no-store', // Disable caching altogether
	});
}



const brokenFeatures = new CachedFunction('broken-features', {
	async updater() {
	// To facilitate debugging, ignore hotfixes during development.
	// Change the version in manifest.json to test hotfixes
		if (isDevelopmentVersion()) {
			return [];
		}

		const content = await fetchHotfix('broken-features.csv');
		return parseBrokenFeaturesCsv(content, currentVersion);
	},
	maxAge: {hours: 6},
	staleWhileRevalidate: {days: 30},
});

const styleHotfixes = new CachedFunction('style-hotfixes', {
	// To facilitate debugging, ignore hotfixes during development.
	// Change the version in manifest.json to test hotfixes
	updater: async (version) =>
		isDevelopmentVersion() ? '' : fetchHotfix(`style/${version}.css`),

	maxAge: {hours: 6},
	staleWhileRevalidate: {days: 300},
	cacheKey: () => '',
});

function brokenFeaturesAsOptions(brokenFeaturesStorage = []) {
	const options = {};
	for (const [feature] of brokenFeaturesStorage) {
		const currentFeature = getNewFeatureName(feature);
		if (currentFeature) {
			options[`feature:${currentFeature}`] = false;
		}
	}

	return options;
}

async function applyStyleHotfixes(style) {
	if (!style || isEnterprise()) {
		return;
	}

	// Prepend to body because that's the only way to guarantee they come after the static file
	document.body.prepend(React.createElement('style', null, style));
}

let localStrings = {};
function _(...arguments_) {
	const original = any(...arguments_);
	return localStrings[original] ?? original;
}

const localStringsHotfix = new CachedFunction('strings-hotfixes', {
	async updater() {
		const json = await fetchHotfix('strings.json');
		return json ? JSON.parse(json) : {};
	},
	maxAge: {hours: 6},
	staleWhileRevalidate: {days: 30},
});

// Updates the local object from the storage to enable synchronous access
async function preloadSyncLocalStrings() {
	if (isDevelopmentVersion() || isEnterprise()) {
		return;
	}

	localStrings = await localStringsHotfix.get() ?? {};
}

export { _, applyStyleHotfixes, brokenFeatures, brokenFeaturesAsOptions, preloadSyncLocalStrings, styleHotfixes };
