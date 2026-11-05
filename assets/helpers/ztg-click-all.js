import memoize from '../npm/ztg-memoize.js';
import { $$ } from '../npm/ztg-select-dom.js';
import preserveScroll from './ztg-preserve-scroll.js';

function clickAllExcept(elementsToClick, except) {
	for (const item of $$(elementsToClick)) {
		if (item !== except) {
			item.click();
		}
	}
}

var clickAll = memoize((selector) => event => {
	if (!(event.altKey && event.isTrusted)) {
		return;
	}

	const clickedItem = event.delegateTarget;

	// `parentElement` is the anchor because `clickedItem` might be hidden/replaced after the click
	const resetScroll = preserveScroll(clickedItem.parentElement);
	clickAllExcept(typeof selector === 'string' ? selector : selector(clickedItem), clickedItem);
	resetScroll();
});

export { clickAll as default };
