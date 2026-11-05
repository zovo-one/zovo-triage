import React from '../npm/ztg-dom-chef.js';
import { isClosedConversation, isPRConversation } from '../npm/ztg-github-url-detection.js';
import { elementExists } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import { linkifyCommit } from '../github-helpers/ztg-dom-formatters.js';
import getPrInfo from '../github-helpers/ztg-get-pr-info.js';
import { buildRepoUrl } from '../github-helpers/ztg-index.js';
import { getBranches } from '../github-helpers/ztg-pr-branches.js';
import { deletedHeadRepository, prMergeabilityBoxCaption } from '../github-helpers/ztg-selectors.js';
import { isTextNodeContaining } from '../helpers/ztg-dom-utils.js';
import pluralize from '../helpers/ztg-pluralize.js';
import observe from '../helpers/ztg-selector-observer.js';

function getBaseCommitNotice(prInfo) {
	const {base} = getBranches();
	const commit = linkifyCommit(prInfo.baseRefOid);
	const count = pluralize(prInfo.behindBy, '$$ commit');
	const countLink = (
		React.createElement('a', { href: buildRepoUrl('compare', `${prInfo.baseRefOid.slice(0, 8)}...${base.branch}`),}
, count
)
	);
	return (
		React.createElement('div', null, "It’s " , countLink, " behind (base commit: "    , commit, ")")
	);
}

async function addInfo(statusMeta) {
	const {base} = getBranches();
	const prInfo = await getPrInfo(base.relative);
	if (!prInfo.needsUpdate) {
		return;
	}

	const previousMessage = statusMeta.firstChild; // Extract now because it won't be the first child anymore
	statusMeta.prepend(getBaseCommitNotice(prInfo));
	// When there are conflicts, GitHub wraps the text in a span, so only attempt removal on text nodes
	if (previousMessage instanceof Text && isTextNodeContaining(previousMessage, 'Merging can be performed automatically.')) {
		previousMessage.remove();
	}
}

async function init(signal) {
	observe(
		prMergeabilityBoxCaption,
		addInfo,
		{signal},
	);
}

void features.add(import.meta.url, {
	include: [
		isPRConversation,
	],
	exclude: [
		isClosedConversation,
		() => elementExists(deletedHeadRepository),
	],
	awaitDomReady: true, // DOM-based exclusions
	requiresToken: true,
	init,
});

/*
Test URLs

PR without conflicts
https://github.com/refined-github/sandbox/pull/60

Draft PR without conflicts
https://github.com/refined-github/sandbox/pull/61

Native "Update branch" button
(pick a conflict-free PR from https://github.com/refined-github/refined-github/pulls?q=is%3Apr+is%3Aopen+sort%3Acreated-asc)

Native "Resolve conflicts" button
https://github.com/refined-github/sandbox/pull/9

Cross-repo PR with long branch names
https://github.com/refined-github/sandbox/pull/13

*/
