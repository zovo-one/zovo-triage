import { clsx } from '../npm/ztg-clsx-clsx.js';
import delegate from '../npm/ztg-delegate-it-delegate.js';
import React from '../npm/ztg-dom-chef.js';
import { isMergedPR, isPRConversation } from '../npm/ztg-github-url-detection.js';
import { elementExists, closestElement, $optional, $, $$ } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import api from '../github-helpers/ztg-api.js';
import getPrInfo from '../github-helpers/ztg-get-pr-info.js';
import { isArchivedRepoAsync } from '../github-helpers/ztg-index.js';
import { getBranches } from '../github-helpers/ztg-pr-branches.js';
import { deletedHeadRepository } from '../github-helpers/ztg-selectors.js';
import showToast from '../github-helpers/ztg-toast.js';
import { getIdentifiers } from '../helpers/ztg-feature-helpers.js';
import observe from '../helpers/ztg-selector-observer.js';
import { withTooltipRef } from '../components/ztg-tooltip.js';
import updatePullRequestBranch from './ztg-update-pr-from-base-branch.gql.js';

/* eslint-disable @typescript-eslint/naming-convention -- Uppercase to match GraphQL enum values */
const updateMethods = {
	MERGE: {
		buttonLabel: 'Update branch',
		tooltip: 'Update branch with merge commit using Refined GitHub',
	},
	REBASE: {
		buttonLabel: 'Rebase',
		tooltip: 'Update branch with rebase using Refined GitHub',
	},
};
/* eslint-enable @typescript-eslint/naming-convention */

/**
https://docs.github.com/en/graphql/reference/enums#pullrequestbranchupdatemethod
*/











async function mergeBranches(options) {
	return api.v4uncached(updatePullRequestBranch, {
		variables: {
			input: {...options},
		},
	});
}

async function handler({delegateTarget: button}) {
	button.disabled = true;
	const {method} = button.dataset ;

	await showToast(async () => {
		const {base} = getBranches();
		const {id, headRefOid} = await getPrInfo(base.relative);
		const options = {
			expectedHeadOid: headRefOid,
			pullRequestId: id,
			updateMethod: method,
		};
		// eslint-disable-next-line @typescript-eslint/use-unknown-in-catch-callback-variable -- Just pass it along
		const response = await mergeBranches(options).catch(error => error);
		if (response instanceof Error) {
			throw new Error(`Error updating the branch: ${response.message}`, {cause: response});
		}
	}, {
		message: 'Updating branch…',
		doneMessage: 'Branch updated',
	});

	closestElement('.ButtonGroup', button).remove();
}

const feature = getIdentifiers(import.meta.url);

function createButtonGroup() {
	return (
		React.createElement('div', { className: "ButtonGroup",}
, Object.entries(updateMethods).map(([method, label]) => (
				React.createElement('div', null
, React.createElement('button', {
						ref: withTooltipRef(label.tooltip),
						className: clsx('Button--secondary Button--medium Button', feature.class),
						'data-method': method,
						type: "button",}

, React.createElement('span', { className: "Button-content",}
, React.createElement('span', { className: "Button-label",}
, label.buttonLabel
)
)
)
)
			))
)
	);
}

function setButtonsDisabledState(base, disabled) {
	for (const button of $$('button', base)) {
		button.disabled = disabled;
	}
}

async function isBranchUpdatable() {
	const {base} = getBranches();
	const prInfo = await getPrInfo(base.relative);

	const hasBranchAccess = ['ADMIN', 'WRITE'].includes(prInfo.headRepoPerm); // #8555
	const canUpdateBranch = prInfo.viewerCanUpdate || prInfo.viewerCanEditFiles || hasBranchAccess;

	return prInfo.needsUpdate && canUpdateBranch && prInfo.mergeable !== 'CONFLICTING';
}

async function manageButtonGroup(stateIcon) {
	const existingButtonGroup = $optional(`.ButtonGroup:has(.${feature.class})`);

	if (elementExists('.octicon-check', stateIcon)) {
		if (!await isBranchUpdatable()) {
			return;
		}

		if (existingButtonGroup) {
			setButtonsDisabledState(existingButtonGroup, false);
			return;
		}

		// The same container as the native button uses
		$('section[aria-label="Conflicts"] div[class^="MergeBoxSectionHeader-module__contentLayout"]')
			.append(createButtonGroup());

		return;
	}

	// Loading icon, GitHub is determining the mergeability status
	if (stateIcon.className.includes('Spinner')) {
		if (existingButtonGroup) {
			// Disable buttons until the status is determined
			setButtonsDisabledState(existingButtonGroup, true);
		}

		return;
	}

	if (elementExists('.octicon-alert-fill', stateIcon)) {
		// Button group won't exist if it wasn't previously added
		// For example, if a PR already had conflicts when its page was opened
		existingButtonGroup?.remove();
		return;
	}

	throw new TypeError('Unexpected state icon', {cause: stateIcon});
}

async function init(signal) {
	delegate(feature.selector, 'click', handler, {signal});
	observe(
		'section[aria-label="Conflicts"] .flex-shrink-0 > :first-child',
		manageButtonGroup,
		{signal},
	);
}

void features.add(import.meta.url, {
	include: [
		isPRConversation,
	],
	exclude: [
		isMergedPR,
		() => elementExists(deletedHeadRepository),
		isArchivedRepoAsync,
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

PRs to repos without write access, find one among your own PRs here:
https://github.com/pulls?q=is%3Apr+is%3Aopen+author%3A%40me+archived%3Afalse+-user%3A%40me

*/
