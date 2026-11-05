import delegate from '../npm/ztg-delegate-it-delegate.js';
import { isAlteredClick } from '../npm/ztg-filter-altered-clicks.js';
import { isConversation } from '../npm/ztg-github-url-detection.js';
import { closestElement } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import onAlteredClick from '../helpers/ztg-on-altered-click.js';

function getLinkToLine(lineNumberCell) {
	const {lineNumber} = lineNumberCell.dataset;
	if (!lineNumber) {
		throw new Error('Expected the cell to have the `data-line-number` attribute');
	}

	const fileLink = closestElement(['.Box', '.review-thread-component'], lineNumberCell)
		.querySelector(['a[href*="#L"]', 'a[href*="#diff-"]']);

	return fileLink.hash.startsWith('#diff-')
		? fileLink.pathname + fileLink.hash + `R${lineNumber}`
		: fileLink.pathname + `#L${lineNumber}`;
}

function openLinkToLine(event) {
	if (!isAlteredClick(event)) {
		location.assign(getLinkToLine(event.delegateTarget));
	}
}

function openLinkToLineInNewTab(event) {
	window.open(getLinkToLine(event.delegateTarget), '_blank');
}

const lineNumberCellSelector = 'td.blob-num:not(.blob-num-hunk, .empty-cell)';

function init(signal) {
	delegate(lineNumberCellSelector, 'click', openLinkToLine, {signal});
	onAlteredClick(lineNumberCellSelector, openLinkToLineInNewTab, {signal});
}

void features.addCssFeature(import.meta.url);
void features.add(import.meta.url, {
	include: [
		isConversation,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/sandbox/pull/81

*/
