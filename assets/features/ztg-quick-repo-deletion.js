import delegate from '../npm/ztg-delegate-it-delegate.js';
import React from '../npm/ztg-dom-chef.js';
import elementReady from '../npm/ztg-element-ready.js';
import { isRepoRoot, isForkedRepo, isRepoSettings, isOrganizationRepo } from '../npm/ztg-github-url-detection.js';
import TrashIcon from '../npm/ztg-octicons-plain-react-components-Trash.js';
import { $, $optional } from '../npm/ztg-select-dom.js';
import { setFieldText } from '../npm/ztg-text-field-edit.js';
import features from '../ztg-feature-manager.js';
import api from '../github-helpers/ztg-api.js';
import { userIsAdmin } from '../github-helpers/ztg-get-user-permission.js';
import { expectTokenScope } from '../github-helpers/ztg-github-token.js';
import { buildRepoUrl, getRepo, getForkedRepo } from '../github-helpers/ztg-index.js';
import showToast from '../github-helpers/ztg-toast.js';
import addNotice from '../github-helpers/ztg-notice-bar.js';
import observe from '../helpers/ztg-selector-observer.js';
import addTooltip, { withTooltipRef } from '../components/ztg-tooltip.js';

const tooltip = {label: 'Instant deletion via', shortcut: 'alt click'} ;
const buttonHashSelector = '#dialog-show-repo-delete-menu-dialog';

// Only if the repository hasn't been starred
async function isRepoUnpopular() {
	const counter = await elementReady('[data-testid="star-button"] [data-component="CounterLabel"]');
	return counter.textContent === '0';
}

async function deleteRepository() {
	const {nameWithOwner} = getRepo();
	await expectTokenScope('delete_repo');
	await api.v3('/repos/' + nameWithOwner, {
		method: 'DELETE',
		responseFormat: 'text',
	});
}

async function modifyUiAfterSuccessfulDeletion() {
	const {nameWithOwner, owner} = getRepo();
	const forkSource = '/' + getForkedRepo();
	const restoreUrl = isOrganizationRepo()
		? `/organizations/${owner}/settings/deleted_repositories`
		: '/settings/deleted_repositories';
	const otherForksUrl = `/${owner}?tab=repositories&type=fork`;

	await addNotice(
		React.createElement(React.Fragment, null
, React.createElement(TrashIcon, null )
, React.createElement('span', null, "Repository "
 , React.createElement('strong', null, nameWithOwner), " deleted. "  , React.createElement('a', { href: restoreUrl,}, "Restore it" ), ",", ' '
, React.createElement('a', { href: forkSource,}, "visit the source repo"   ), ", or see "   , React.createElement('a', { href: otherForksUrl,}, "your other forks."  )
)
),
		{action: false},
	);
	$('.application-main').remove();
}

async function handleAltClick(event) {
	if (!event.altKey) {
		return;
	}

	event.preventDefault();

	// Can't really prevent default, so we must close the dialog if we're on the repo settings page
	// https://github.com/refined-github/refined-github/pull/7866#issuecomment-2396270060
	$optional('#' + event.delegateTarget.getAttribute('data-show-dialog-id'))?.close();

	const {nameWithOwner} = getRepo();
	if (confirm(`⚠️${nameWithOwner}⚠️ will be deleted. Are you sure?`)) {
		await showToast(deleteRepository, {
			message: 'Deleting repo…',
			doneMessage: 'Repo deleted',
		});

		await modifyUiAfterSuccessfulDeletion();
	}
}

function addShortcutTooltip(button) {
	addTooltip(tooltip, button);
}

function addButton(header) {
	header.prepend(
		React.createElement('li', null
, React.createElement('a', {
				href: buildRepoUrl('settings', buttonHashSelector),
				className: "btn btn-sm btn-danger rgh-quick-repo-deletion"   ,
				ref: withTooltipRef(tooltip),}

, React.createElement(TrashIcon, { className: "mr-2 tmp-mr-2" ,} ), "Delete fork"

)
),
	);
}

function autoFill(field) {
	setFieldText(field, getRepo().nameWithOwner);
}

function autoOpenModal(signal) {
	$(buttonHashSelector).click();
	observe('.js-repo-delete-proceed-confirmation', autoFill, {signal});
}

async function initRepoRoot(signal) {
	observe('[data-testid="repo-header-actions"]', addButton, {signal});
	delegate('.rgh-quick-repo-deletion', 'click', handleAltClick, {signal});
}

async function initRepoSettings(signal) {
	delegate(buttonHashSelector, 'click', handleAltClick, {signal});
	observe(buttonHashSelector, addShortcutTooltip, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		isRepoRoot,
		isForkedRepo,
		userIsAdmin,
		isRepoUnpopular,
	],
	init: initRepoRoot,
}, {
	include: [
		isRepoSettings,
	],
	init: initRepoSettings,
}, {
	include: [
		() => location.hash === buttonHashSelector,
	],
	awaitDomReady: true, // The expected element is towards the bottom of the page
	init: autoOpenModal,
});

/*

Test URLs:

1. Fork a repo, like https://github.com/left-pad/left-pad
2. Star it to see if the "Delete fork" button disappears
3. Click "Delete fork"
4. The confirmation dialog should appear
5. On the last step, the repo name field should be auto-filled

*/
