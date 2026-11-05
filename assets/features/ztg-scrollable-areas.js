import delegate from '../npm/ztg-delegate-it-delegate.js';
import { hasComments } from '../npm/ztg-github-url-detection.js';
import features from '../ztg-feature-manager.js';
import { is, not } from '../helpers/ztg-css-selectors.js';

// These selectors must be kept in sync with the selectors in scrollable-areas.css
const scrollableSelector = is(
	'.comment-body',
	'[data-testid="markdown-body"]',
)
+ ' '
+ is(
	'blockquote',
	'pre',
) + not(
	/* Exclude clicked areas */
	'.rgh-scrollable-expanded',
	/* Exclude nested scrollable areas */
	'blockquote *',
	'pre *',
);

function disableScroll(event) {
	const area = event.delegateTarget;
	if (area.scrollHeight <= area.clientHeight) {
		return;
	}

	window.scrollBy(0, area.scrollTop);
	area.classList.add('rgh-scrollable-expanded');
}

function init(signal) {
	delegate(scrollableSelector, 'click', disableScroll, {signal});
}

void features.addCssFeature(import.meta.url);
void features.add(import.meta.url, {
	include: [
		hasComments,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github/pull/1146#issuecomment-377296024

*/
