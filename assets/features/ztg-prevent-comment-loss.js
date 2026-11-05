import delegate from '../npm/ztg-delegate-it-delegate.js';
import filterAlteredClicks from '../npm/ztg-filter-altered-clicks.js';
import { hasRichTextEditor, isEditingFile } from '../npm/ztg-github-url-detection.js';
import features from '../ztg-feature-manager.js';

const openInNewTab = filterAlteredClicks((event) => {
	event.preventDefault();
	window.open(event.delegateTarget.href, '_blank');
});

function init(signal) {
	delegate(
		[
			// Ignore self-reference links: https://github.com/refined-github/refined-github/pull/8854#issuecomment-3794351054
			'.js-preview-body a[href]', // `hasRichTextEditor`
			'.html-blob a', // `isEditingFile`
		],
		'click',
		openInNewTab,
		{signal},
	);
}

void features.add(import.meta.url, {
	include: [
		hasRichTextEditor,
		isEditingFile,
	],
	init,
});

/*

## Test URLs

https://github.com/refined-github/sandbox/issues/new
https://github.com/refined-github/refined-github/edit/main/readme.md

*/

export { openInNewTab };
