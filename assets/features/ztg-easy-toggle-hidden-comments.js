import delegate from '../npm/ztg-delegate-it-delegate.js';
import { isConversation } from '../npm/ztg-github-url-detection.js';
import { $ } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import { wasInteractiveElementClicked } from './ztg-easy-toggle-commit-messages.js';

function toggle(event) {
	if (!wasInteractiveElementClicked(event)) {
		$(
			[
				'.review-thread-chevron', // PRs
				'button:has(> .octicon-unfold, > .octicon-fold)', // Issues
			],
			event.delegateTarget,
		).click();
	}
}

function init(signal) {
	delegate(
		[
			'.js-toggle-outdated-comments', // PRs
			'div[data-testid="comment-header"]:has(.octicon-unfold, .octicon-fold)', // Issues
		],
		'click',
		toggle,
		{signal},
	);
}

void features.add(import.meta.url, {
	include: [
		isConversation,
	],
	init,
});

/*

Test URLs:

- Resolved PR review: https://github.com/refined-github/sandbox/pull/47#pullrequestreview-4175514676

- Hidden issue comment: https://github.com/refined-github/sandbox/issues/131#issuecomment-4297544223

*/
