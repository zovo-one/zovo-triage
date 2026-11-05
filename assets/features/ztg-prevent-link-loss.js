import { hasRichTextEditor } from '../npm/ztg-github-url-detection.js';
import { closestElement, $optional } from '../npm/ztg-select-dom.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { mount } from '../npm/ztg-svelte-internal-client-render.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import features from '../ztg-feature-manager.js';
import observe from '../helpers/ztg-selector-observer.js';
import Prevent_link_loss from './ztg-prevent-link-loss.svelte.js';

function attach(field) {
	const target = closestElement([
		// Almost everywhere
		// Don't use only `fieldset` https://github.com/refined-github/refined-github/issues/9955
		'*:has(> fieldset)',

		// Editing PR body
		'.CommentBox',
	], field);

	mount(Prevent_link_loss, {
		target,
		anchor: $optional(':scope > fieldset + *', target), // After fieldset, if found
		props: {field},
	});
}

function init(signal) {
	observe([
		'textarea.js-comment-field',
		'[class*="MarkdownInput-module__textArea"] textarea',
	], attach, {signal});
}

void features.add(import.meta.url, {
	include: [
		hasRichTextEditor,
	],
	init,
});

/*

Test content:

```
https://github.com/refined-github/refined-github/pull/6954/commits/32d1c8b2e1b6971709fe273cfdd1f959b51e8d85
https://github.com/refined-github/refined-github/pull/6954/changes/32d1c8b2e1b6971709fe273cfdd1f959b51e8d85..5d28ba424368606c7b241840cf4386f23ce66ec3
```

Test URLs:

New issue form: https://github.com/refined-github/refined-github/issues/new?assignees=&labels=bug&projects=&template=1_bug_report.yml
New comment form: https://github.com/refined-github/sandbox/issues/3
New review form: https://github.com/refined-github/sandbox/pull/4/files#review-changes-modal
New review comment form: https://github.com/refined-github/sandbox/pull/4/files

*/
