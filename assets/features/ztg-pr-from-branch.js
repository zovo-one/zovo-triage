import React from '../npm/ztg-dom-chef.js';
import GitPullRequestIcon from '../npm/ztg-octicons-plain-react-components-GitPullRequest.js';
import { isRepoRoot } from '../npm/ztg-github-url-detection.js';
import { $optional } from '../npm/ztg-select-dom.js';
import { assertTextContent } from '../helpers/ztg-dom-utils.js';
import features from '../ztg-feature-manager.js';
import observe from '../helpers/ztg-selector-observer.js';

function unwrap(button) {
	assertTextContent(button, 'Contribute');

	const commitsAhead = $optional('[data-testid="branch-info-bar"] > span > a');
	// The link might be missing altogether if the branch is up to date
	if (!commitsAhead?.textContent.includes('ahead of')) {
		// The link is "x commits behind" so there's nothing to unwrap
		return;
	}

	button.replaceWith(
		React.createElement('a', { className: "btn", href: commitsAhead.href + '?expand=1',}
, React.createElement(GitPullRequestIcon, { className: "mr-2 tmp-mr-2" ,} ), "Open pull request"

),
	);
}

function init(signal) {
	observe('[data-testid="branch-info-bar"] button[aria-haspopup="true"]', unwrap, {signal});
}

void features.add(import.meta.url, {
	include: [
		isRepoRoot,
	],
	init,
});

/*

Test URLs:

- Ahead, can open PR: https://github.com/refined-github/sandbox/tree/new
- Behind, can't open PRs: https://github.com/refined-github/sandbox/tree/behind

*/
