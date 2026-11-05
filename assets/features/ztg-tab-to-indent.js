import { hasRichTextEditor } from '../npm/ztg-github-url-detection.js';
import { eventHandler } from '../npm/ztg-indent-textarea.js';
import features from '../ztg-feature-manager.js';
import { onCommentFieldKeydown } from '../github-events/ztg-on-field-keydown.js';

function init(signal) {
	onCommentFieldKeydown(eventHandler, signal);
}

void features.add(import.meta.url, {
	include: [
		hasRichTextEditor,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github/issues/new?template=1_bug_report.yml

*/
