import React from './npm/ztg-dom-chef.js';
import domLoaded from './npm/ztg-dom-loaded.js';
import { is500, isPasswordConfirmation } from './npm/ztg-github-url-detection.js';
import oneEvent from './npm/ztg-one-event.js';
import { elementExists } from './npm/ztg-select-dom.js';
import stripIndent from './npm/ztg-strip-indent.js';
import { isWebPage } from './npm/ztg-webext-detect.js';
import { messageRuntime } from './npm/ztg-webext-msg.js';
import { expectToken } from './github-helpers/ztg-github-token.js';
import asyncForEach from './helpers/ztg-async-for-each.js';
import bisectFeatures from './helpers/ztg-bisect.js';
import { catchErrors, disableErrorLogging } from './helpers/ztg-errors.js';
import { listenToAjaxedLoad, log, getFeatureId, shortcutMap } from './helpers/ztg-feature-helpers.js';
import { isFeaturePrivate, shouldFeatureRun } from './helpers/ztg-feature-utils.js';
import { brokenFeatures, preloadSyncLocalStrings, applyStyleHotfixes, brokenFeaturesAsOptions } from './helpers/ztg-hotfix.js';
import ArrayMap from './helpers/ztg-map-of-arrays.js';
import waitFor from './helpers/ztg-wait-for.js';
import optionsStorage, { isFeatureDisabled } from './ztg-options-storage.js';
import { contentScriptToggle } from './options/ztg-reload-without.js';

/* eslint-disable no-await-in-loop -- Event loops */

































const currentFeatureControllers = new ArrayMap();

function unloadAll() {
	for (const feature of currentFeatureControllers.values()) {
		for (const controller of feature) {
			controller.abort();
		}
	}

	currentFeatureControllers.clear();
}

// eslint-disable-next-line no-async-promise-executor -- Rule assumes we don't want to leave it pending
const globalReady = new Promise(async resolve => {
	if (!isWebPage()) {
		throw new Error('This script should only be run on web pages');
	}

	listenToAjaxedLoad();

	const [options, willLoadContentScripts, localHotfixes, bisectedFeatures] = await Promise.all([
		optionsStorage.getAll(),
		contentScriptToggle.get(),
		brokenFeatures.getCached(), // Cached first, they're fetched asynchronously down below
		bisectFeatures(),
		preloadSyncLocalStrings(),
	]);

	if (!willLoadContentScripts) {
		await contentScriptToggle.remove();
		const message = 'Refined GitHub: scripts were disabled for this load, but CSS can’t be disabled this way.';
		console.warn(message);
		alert(message);
		return;
	}

	log.setup(options);

	await waitFor(() => document.body);

	if (is500() || isPasswordConfirmation()) {
		return;
	}

	if (elementExists('[refined-github]')) {
		console.warn(stripIndent(`
			Refined GitHub has been loaded twice. This may be because:

			• You loaded the developer version, or
			• The extension just updated

			If you see this at every load, please open an issue mentioning the browser you're using and the URL where this appears.
		`));
		return;
	}

	document.documentElement.setAttribute('refined-github', '');

	// Request in the background page to avoid showing a 404 request in the console
	// https://github.com/refined-github/refined-github/issues/6433
	void messageRuntime({getStyleHotfixes: true}).then(applyStyleHotfixes);

	if (options.customCss.trim().length > 0) {
		// Review #5857 and #5493 before making changes
		document.head.append(React.createElement('style', null, options.customCss));
	}

	if (bisectedFeatures) {
		Object.assign(options, bisectedFeatures);
	} else {
		// Use cached first
		Object.assign(options, brokenFeaturesAsOptions(localHotfixes));

		// Asynchronously fetch the rest, if expired
		void brokenFeatures.get();
	}

	if (elementExists('body.logged-out')) {
		console.warn('Refined GitHub is only expected to work when you’re logged in to GitHub. Errors will not be shown.');
		disableErrorLogging();
	} else {
		catchErrors();
	}

	// Detect unload via two events to catch both clicks and history navigation
	// https://github.com/refined-github/refined-github/issues/6437#issuecomment-1489921988
	document.addEventListener('turbo:before-fetch-request', unloadAll); // Clicks
	document.addEventListener('turbo:visit', unloadAll); // Back/forward button

	resolve(options);
});

function castArray(value) {
	return Array.isArray(value) ? value : [value];
}

async function add(url, ...loaders) {
	const id = getFeatureId(url);

	/* Feature filtering and running */
	const options = await globalReady;

	// Skip disabled features, unless the feature is private
	if (isFeatureDisabled(options, id) && !isFeaturePrivate(id)) {
		if (loaders.length === 0) {
			// CSS-only https://github.com/refined-github/refined-github/issues/7944
			// GitHub cleans up the CSS disabling attributes after navigation.
			// https://github.com/refined-github/refined-github/issues/8172
			do {
				document.documentElement.setAttribute('rgh-OFF-' + id, '');
				log.info('↩️', 'Skipping', id);
			} while (await oneEvent(document, ['turbo:render', 'soft-nav:react-done']));
		} else {
			log.info('↩️', 'Skipping', id);
		}

		return;
	}

	if (loaders.length === 0) {
		// CSS-only
		return;
	}

	void asyncForEach(loaders, async loader => {
		// Input defaults and validation
		const {
			shortcuts = {},
			asLongAs,
			include,
			exclude,
			init,
			awaitDomReady = false,
			requiresToken = false,
			deduplicate = false,
		} = loader;

		if (include?.length === 0) {
			throw new Error(`${id}: \`include\` cannot be an empty array, it means "run nowhere"`);
		}

		let isFirstLoop = true;
		do {
			if (awaitDomReady) {
				await domLoaded;
			}

			if (isFirstLoop) {
				isFirstLoop = false;
			} else if (deduplicate !== false && elementExists(deduplicate)) {
				continue;
			}

			if (!await shouldFeatureRun({asLongAs, include, exclude})) {
				continue;
			}

			if (requiresToken) {
				await expectToken();
			}

			const featureController = new AbortController();
			currentFeatureControllers.append(id, featureController);

			// Do not await, or else an error on a page will break the feature completely until a reload
			void asyncForEach(castArray(init), async singleInit => {
				const didRun = await singleInit(featureController.signal);
				// Features can return `false` when they decide not to run on the current page
				if (didRun !== false && !isFeaturePrivate(id)) {
					log.info('✅', id);
					// Register feature shortcuts
					for (const [hotkey, description] of Object.entries(shortcuts)) {
						shortcutMap.set(hotkey, description);
					}
				}
			});
		} while (await oneEvent(document, ['turbo:render', 'soft-nav:react-done']));
	});
}

async function addCssFeature(url) {
	void add(url);
}

function unload(featureUrl) {
	const id = getFeatureId(featureUrl);
	for (const controller of currentFeatureControllers.get(id) ?? []) {
		controller.abort();
	}
}

const features = {
	add,
	unload,
	addCssFeature,
};

export { features as default };
