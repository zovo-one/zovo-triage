import React from '../npm/ztg-dom-chef.js';
import { isCompare } from '../npm/ztg-github-url-detection.js';
import features from '../ztg-feature-manager.js';
import { defaultBranchOfRepo } from '../github-helpers/ztg-get-default-branch.js';
import parseCompareUrl from '../github-helpers/ztg-parse-compare-url.js';
import observe from '../helpers/ztg-selector-observer.js';

async function addWarning(anchor) {
	anchor.before(
		React.createElement('div', { className: "flash flash-error my-3 tmp-my-3"   ,}
, React.createElement('strong', null, "Note:"), " Creating a PR from the default branch is an"         , ' '
, React.createElement('a', {
				href: "https://jmeridth.com/posts/do-not-issue-pull-requests-from-your-master-branch/",
				target: "_blank",
				rel: "noopener noreferrer" ,}
, "anti-pattern"

), "."
),
	);
}

function init(signal) {
	observe('.js-compare-pr', addWarning, {signal});
}

async function isCrossRepoCompareFromMain() {
	const c = parseCompareUrl(location.pathname);

	return Boolean(c && c.isCrossRepo && c.head.branch === await defaultBranchOfRepo.get(c.head.repo));
}

void features.add(import.meta.url, {
	asLongAs: [
		isCompare,
		isCrossRepoCompareFromMain,
	],
	init,
});

/*

Test URLs:

- Simple: https://github.com/refined-github/refined-github/compare/main...fregante:main
- Renamed fork and changed default branch: https://github.com/refined-github/sandbox/compare/default-a...bfred-it-org:github-sandbox:main?expand=1
- Non-standard default name: https://github.com/refined-github/refined-github/compare/sandbox/keep-branch...yakov116:upstream

*/
