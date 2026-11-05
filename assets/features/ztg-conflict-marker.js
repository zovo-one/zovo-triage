import batchedFunction from '../npm/ztg-batched-function.js';
import React from '../npm/ztg-dom-chef.js';
import { isIssueOrPRList } from '../npm/ztg-github-url-detection.js';
import AlertIcon from '../npm/ztg-octicons-plain-react-components-Alert.js';
import features from '../ztg-feature-manager.js';
import api from '../github-helpers/ztg-api.js';
import { openPrsListLink, commentBoxHashPr } from '../github-helpers/ztg-selectors.js';
import observe from '../helpers/ztg-selector-observer.js';
import { withTooltipRef } from '../components/ztg-tooltip.js';

async function addIcon(links) {
	const prConfigs = links.map(link => {
		const [, owner, name, , prNumber] = link.pathname.split('/', 5);
		const key = api.escapeKey(owner, name, prNumber);
		return {
			key,
			link,
			owner,
			name,
			number: Number(prNumber),
		};
	});

	// Batch queries cannot be exported to .gql files
	const batchQuery = prConfigs.map(({key, owner, name, number}) => `
		${key}: repository(owner: "${owner}", name: "${name}") {
			pullRequest(number: ${number}) {
				mergeable
				state
				isDraft
			}
		}
	`).join('\n');

	const data = await api.v4(batchQuery);

	for (const pr of prConfigs) {
		const {mergeable, state, isDraft} = data[pr.key].pullRequest;
		if (mergeable === 'CONFLICTING' && (state === 'OPEN' || isDraft)) {
			pr.link.after(
				React.createElement('a', {
					ref: withTooltipRef({label: 'This PR has conflicts that must be resolved', direction: 'e'}),
					className: "rgh-conflict-marker color-fg-muted ml-2 tmp-ml-2"   ,
					href: pr.link.pathname + commentBoxHashPr,}

, React.createElement(AlertIcon, { className: "v-align-middle",} )
),
			);
		}
	}
}

async function init(signal) {
	observe(openPrsListLink, batchedFunction(addIcon, {delay: 100}), {signal});
}

void features.add(import.meta.url, {
	include: [
		isIssueOrPRList,
	],
	requiresToken: true,
	init,
});

/*
Test URLs
https://github.com/pulls
https://github.com/refined-github/sandbox/issues?q=conflict
https://github.com/kubernetes/kubernetes/milestone/62
*/
