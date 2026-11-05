import { mergeSignals } from '../npm/ztg-abort-utils-merge-signals.js';
import { signalFromPromise } from '../npm/ztg-abort-utils-signal-from-promise.js';
import { any } from '../npm/ztg-code-tag.js';
import React from '../npm/ztg-dom-chef.js';
import domLoaded from '../npm/ztg-dom-loaded.js';
import optionsStorage from '../ztg-options-storage.js';
import getCallerId from './ztg-caller-id.js';
import delay from './ztg-delay.js';
import { parseFeatureNameFromStack } from './ztg-errors.js';
import onetime from './ztg-onetime.js';

const animation = 'rgh-selector-observer';

const registerAnimation = onetime(() => {
	document.head.append(React.createElement('style', null, `@keyframes ${animation} {}`));
});

function observe


(
	selectors,
	listener,
	{signal, stopOnDomReady, once, ancestor} = {},
) {
	if (signal?.aborted) {
		return;
	}

	if (stopOnDomReady) {
		const delayedDomReady = signalFromPromise((async () => {
			await domLoaded;
			await delay(100); // Allow the animation and events to complete; Also adds support for ajaxed pages
		})());

		signal = mergeSignals(signal, delayedDomReady);
	}

	let onceController;
	if (once) {
		onceController = new AbortController();
		signal = mergeSignals(signal, onceController.signal);
	}

	const selector = typeof selectors === 'string' ? selectors : selectors.join(',\n');
	const seenMark = 'rgh-seen-' + getCallerId(ancestor);

	registerAnimation();

	const rule = document.createElement('style');
	// Enable when/if needed
	// if (isDevelopmentVersion()) {
	// 	// For debuggability
	// 	rule.setAttribute('s', selector);
	// }

	rule.textContent = any`
		:where(${selector}):not(.${seenMark}) {
			animation: 1ms ${animation};
		}
	`;
	document.body.prepend(rule);
	signal?.addEventListener('abort', () => {
		rule.remove();
	});

	let wasCalled = false;
	// Capture stack outside
	const currentFeature = parseFeatureNameFromStack();
	(async () => {
		const {logging} = await optionsStorage.getAll();
		if (!logging) {
			return;
		}

		await domLoaded;
		await delay(1000);
		if (!wasCalled && !signal?.aborted) {
			console.warn(currentFeature, '→ Selector not found on page:', selector);
		}
	})();

	globalThis.addEventListener('animationstart', (event) => {
		if (event.animationName !== animation) {
			return;
		}

		const target = event.target ;
		// The target can match a selector even if the animation actually happened on a ::before pseudo-element, so it needs an explicit exclusion here
		if (target.classList.contains(seenMark) || !target.matches(selector)) {
			return;
		}

		wasCalled = true;

		// Removes this specific selector’s animation once it was seen
		target.classList.add(seenMark);

		listener(target, {signal});
		onceController?.abort();
	}, {signal});
}

async function waitForElement


(
	selectors,
	{signal, stopOnDomReady} = {},
) {
	return new Promise(resolve => {
		observe(selectors, element => {
			resolve(element);
		}, {
			signal,
			stopOnDomReady,
			once: true,
			ancestor: 4,
		});

		signal?.addEventListener('abort', () => {
			resolve();
		});
	});
}

export { observe as default, waitForElement };
