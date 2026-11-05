import { clsx } from '../npm/ztg-clsx-clsx.js';
import delegate from '../npm/ztg-delegate-it-delegate.js';
import React from '../npm/ztg-dom-chef.js';
import filterAlteredClicks from '../npm/ztg-filter-altered-clicks.js';
import { isNewIssue } from '../npm/ztg-github-url-detection.js';
import { $, closestElement } from '../npm/ztg-select-dom.js';
import { importedFeatures } from '../ztg-feature-data.js';
import features from '../ztg-feature-manager.js';
import { baseApiFetch } from '../github-helpers/ztg-github-token.js';
import { isRefinedGitHubRepo, visitAjaxedPage, buildRepoUrl, pressEscapeKey } from '../github-helpers/ztg-index.js';
import clearCacheHandler from '../helpers/ztg-clear-cache-handler.js';
import delay from '../helpers/ztg-delay.js';
import { getElementByAriaLabelledBy } from '../helpers/ztg-dom-utils.js';
import { getExtensionReleaseDate, toDaysAgo, wasReleasedLongAgo } from '../helpers/ztg-extension-release-age.js';
import { OptionsLink } from '../helpers/ztg-open-options.js';
import observe from '../helpers/ztg-selector-observer.js';
import { setReactInputValue } from '../helpers/ztg-set-react-text-field-value.js';
import { getToken } from '../ztg-options-storage.js';
import { newIssueMenuItem } from './ztg-new-tab-links.js';

const isSetTheTokenSelector = 'input[type="checkbox"][required]';
const liesGif = 'https://github.com/user-attachments/assets/f417264f-f230-4156-b020-16e4390562bd';

function addNotice(type, message) {
	$('[class^="CreateIssueForm-module__mainContentSection"]').prepend(
		React.createElement('div', { className: clsx('flash', `flash-${type}`, 'h3 my-9 tmp-my-9'), style: {animation: 'pulse-in 0.3s 2'},}
, message
),
	);
}

function addTokenNotice(adjective) {
	addNotice(
		'error',
		React.createElement(React.Fragment, null
, React.createElement('p', null, "Your token is "
   , adjective, ". Many Refined GitHub features don't work without it. You can update it"            , ' '
, React.createElement(OptionsLink, { className: "btn-link",}, "in the options"  ), "."
)
, React.createElement('p', null, "Before creating this issue, add a valid token and confirm the problem still occurs."             )
),
	);
}

function addVersionNotice(releaseAgeInDays) {
	addNotice(
		'warn',
		React.createElement('p', null, "Your Refined GitHub version is "
     , releaseAgeInDays, " days old."  , ' '
, React.createElement('a', { href: "https://github.com/refined-github/refined-github#install",}, "A newer version may be available."     )
),
	);
}

async function checkToken() {
	const token = await getToken();
	if (!token) {
		addTokenNotice('missing');
		return;
	}

	try {
		await baseApiFetch({apiBase: 'https://api.github.com/', path: 'user', token});
	} catch (error) {
		if (!navigator.onLine || (error ).message === 'Failed to fetch') {
			return;
		}

		addTokenNotice('invalid or expired');
		return;
	}

	// Thank you for following the instructions. I'll save you a click.
	const checkbox = $(isSetTheTokenSelector);
	if (!checkbox.checked) {
		checkbox.click();
	}
}

async function setVersion() {
	// Wait for GitHub's listener to be attached #9293
	await delay(1000);

	const field = getElementByAriaLabelledBy(
		'span[class^="TextInputElement-module__issueFormTextField"] > input',
		'Extension version*',
	);

	const {version} = chrome.runtime.getManifest();
	setReactInputValue(field, version);

	if (!await getToken()) {
		// Mark the submission as not having a token set up because people have a tendency to go through forms and read absolutely nothing. This makes it easier to spot liars.
		setReactInputValue(field, '(' + version + ')');
		field.disabled = true;
	}
}

function checkVersionAge() {
	const releaseDate = getExtensionReleaseDate();
	const releaseAgeInDays = toDaysAgo(releaseDate);
	if (wasReleasedLongAgo(releaseAgeInDays)) {
		addVersionNotice(releaseAgeInDays);
	}
}

async function linkifyCacheRefresh() {
	$('[href="#clear-cache"]').replaceWith(
		React.createElement('button', {
			className: "btn",
			type: "button",
			onClick: clearCacheHandler,}
, "Clear cache"

),
	);
}

function Lies() {
	return (
		React.createElement('a', { href: "https://www.youtube.com/watch?v=YWdD206eSv0",}
, React.createElement('img', { src: liesGif, alt: "Just go on the internet and tell lies?"       , className: "d-inline-block",} )
)
	);
}

async function lieDetector({delegateTarget}) {
	if (delegateTarget.checked) {
		closestElement('fieldset', delegateTarget).append(React.createElement(Lies, null ));
	}
}

async function validateTokenCheckbox() {
	if (await getToken()) {
		return;
	}

	// eslint-disable-next-line new-cap -- Preload image
	Lies();

	delegate(isSetTheTokenSelector, 'click', lieDetector, {
		once: true,
	});
}

function addAutocomplete(field) {
	const featureNameListId = 'rgh-feature-name-list';
	field.setAttribute('list', featureNameListId);
	field.after(
		React.createElement('datalist', { id: featureNameListId,}
, importedFeatures.map(feature => React.createElement('option', { value: `\`${feature}\` `,} ))
),
	);
}

function init(signal) {
	observe('input[aria-label="Add a title"]', addAutocomplete, {signal});
	observe('[class^="CreateIssueForm-module__mainContentSection"]', () => {
		void linkifyCacheRefresh();
		void checkToken();
		void validateTokenCheckbox();
		void setVersion();
		checkVersionAge();
	}, {signal});
}

const openNewIssuePage = filterAlteredClicks((event) => {
	event.stopImmediatePropagation();
	visitAjaxedPage(buildRepoUrl('issues/new/choose'));

	// Close popover
	pressEscapeKey();
});

// `rgh-improve-new-issue-form` doesn't work in the modal, so break it.
// `no-modals` intentionally allows the modal on non-rgh repos.
// https://github.com/refined-github/refined-github/issues/9302#issuecomment-4351713907
function noNewIssueModal(signal) {
	delegate(newIssueMenuItem, 'click', openNewIssuePage, {
		capture: true,
		signal,
	});
}

void features.add(import.meta.url, {
	asLongAs: [
		isRefinedGitHubRepo,
	],
	init: noNewIssueModal,
}, {
	asLongAs: [
		isRefinedGitHubRepo,
		isNewIssue,
		() => new URL(location.href).searchParams.get('template') === '1_bug_report.yml',
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github
https://github.com/refined-github/refined-github/issues/new?assignees=&labels=bug&projects=&template=1_bug_report.yml

*/
