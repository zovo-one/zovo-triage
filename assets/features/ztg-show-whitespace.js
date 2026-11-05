import { onAbort } from '../npm/ztg-abort-utils-on-abort.js';
import { hasCode } from '../npm/ztg-github-url-detection.js';
import { closestElementOptional } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import { codeElementsSelector } from '../github-helpers/ztg-dom-formatters.js';
import { is } from '../helpers/ztg-css-selectors.js';
import observe from '../helpers/ztg-selector-observer.js';
import showWhiteSpacesOnLine from '../helpers/ztg-show-whitespace-on-line.js';

const viewportObserver = new IntersectionObserver(changes => {
	for (const {target: line, isIntersecting} of changes) {
		if (!isIntersecting) {
			continue;
		}

		const shouldAvoidSurroundingSpaces = Boolean(closestElementOptional('.blob-wrapper-embedded', line)); // #2285
		showWhiteSpacesOnLine(line, shouldAvoidSurroundingSpaces);
		viewportObserver.unobserve(line);
	}
});

function showWhitespaceWhenInViewport(line) {
	viewportObserver.observe(line);
}

function init(signal) {
	observe(is(codeElementsSelector) + ':not(.blob-code-hunk)', showWhitespaceWhenInViewport, {signal});
	onAbort(signal, viewportObserver);
}

void features.add(import.meta.url, {
	include: [
		hasCode,
	],
	init,
});

/*
TEST URL
https://github.com/refined-github/sandbox/pull/18
*/
