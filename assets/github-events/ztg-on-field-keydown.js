import delegate from '../npm/ztg-delegate-it-delegate.js';
import memoize from '../npm/ztg-memoize.js';
import { elementExists } from '../npm/ztg-select-dom.js';

/* eslint-disable byo/no-inline-functions -- Covered by memoization */





/** Wrapper that skips execution if the user is *in the middle of something*. */
function ignoreInteractive(callback) {
	return event => {
		const field = event.delegateTarget;
		if (
			event.isComposing
			// New autocomplete dropdown
			|| field.hasAttribute('aria-autocomplete')
			// Classic autocomplete dropdown
			|| elementExists('.suggester', field.form)
		) {
			return;
		}

		callback(event);
	};
}

/**
 Memoizes the creation of the wrapped listener.
 If the same `callback` function reference is passed multiple times,
 it returns the exact same wrapped handler, enabling `delegate-it` deduplication.
 */
const deduplicateInteractiveFilter = memoize((callback) => ignoreInteractive(callback));

// Support for `esc` key (where GitHub uses stopPropagation)
const capture = true;

function onCommentFieldKeydown(callback, signal) {
	delegate(
		'textarea',
		'keydown',
		deduplicateInteractiveFilter(callback),
		{signal, capture},
	);
}

function onConversationTitleFieldKeydown(callback, signal) {
	delegate(
		[
			'[class^="prc-PageLayout-Header"] input', // PR
			'input[placeholder="Title"]', // Issue
			"input[name='pull_request[title]']", // Compare
		],
		'keydown',
		deduplicateInteractiveFilter(callback),
		{signal, capture},
	);
}

export { onCommentFieldKeydown, onConversationTitleFieldKeydown };
