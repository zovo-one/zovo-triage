import delegate from '../npm/ztg-delegate-it-delegate.js';
import React from '../npm/ztg-dom-chef.js';
import { isNewRepo, isNewRepoTemplate, isForkingRepo } from '../npm/ztg-github-url-detection.js';
import { $, elementExists } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import api from '../github-helpers/ztg-api.js';
import onetime from '../helpers/ztg-onetime.js';
import observe from '../helpers/ztg-selector-observer.js';
import { overrideTab } from '../components/ztg-extensible-nav-store.js';

const documentation = 'https://github.com/refined-github/refined-github/wiki/Extended-feature-descriptions#new-repo-disable-projects-and-wikis';

async function disableWikiAndProjectsOnce() {
	delete sessionStorage.rghNewRepo;

	await api.v3('', {
		method: 'PATCH',
		body: {
			/* eslint-disable @typescript-eslint/naming-convention -- External API */
			has_projects: false,
			has_wiki: false,
			/* eslint-enable @typescript-eslint/naming-convention */
		},
	});

	overrideTab('wiki', {removed: true});
	overrideTab('projects', {removed: true});
}

function setStorage() {
	if ($('input#rgh-disable-project').checked) {
		sessionStorage.rghNewRepo = true;
	}
}

function add(blueprintRow) {
	const disableProjectsAndWikis = blueprintRow.cloneNode(true);

	disableProjectsAndWikis.classList.add('flash-warn');

	const title = $('.titleBox h3', disableProjectsAndWikis);
	title.textContent = 'Disable Projects and Wikis';

	const description = $('.descriptionBox p', disableProjectsAndWikis);
	description.replaceChildren(
		'After creating the repository disable the projects and wiki. ',
		React.createElement('a', { href: documentation, target: "_blank", rel: "noreferrer",}, "Suggestion by Refined GitHub."   ),
	);

	const control = $('.blockControl', disableProjectsAndWikis);
	control.replaceChildren(
		// Padding/margin classes added to increate hit area
		React.createElement('label', { className: "d-flex gap-1 flex-items-center p-2 tmp-p-2 mr-n2 tmp-mr-n2"      ,}
, React.createElement('input', {
				checked: true,
				// @ts-expect-error Safari only
				switch: true,
				type: "checkbox",
				id: "rgh-disable-project",}
			)
),
	);
	control.classList.add('d-flex', 'flex-items-center');

	blueprintRow.parentElement.append(disableProjectsAndWikis);
}

function addOld(submitButton) {
	// .github repos have a banner that matches this #8716
	if (elementExists('[data-testid="special-repo-name-banner"]')) {
		return;
	}

	submitButton.classList.add('mt-0'); // Normalize it. /new has margin, /:user/:repo/fork does not
	submitButton.parentElement.before(
		React.createElement('div', { className: "flash flash-warn py-0 tmp-py-0 ml-n3 tmp-ml-n3 my-4 tmp-my-3"       ,}
, React.createElement('div', { className: "form-checkbox checked" ,}
, React.createElement('label', null
, React.createElement('input', {
						checked: true,
						type: "checkbox",
						id: "rgh-disable-project",}
					), " Disable Projects and Wikis"
)
, React.createElement('span', { className: "note mb-2 tmp-mb-2"  ,}, "After creating the repository disable the projects and wiki. "
         , React.createElement('a', { href: documentation, target: "_blank", rel: "noreferrer",}, "Suggestion by Refined GitHub."   )
)
)
),
	);
}

async function init(signal) {
	observe('[class^="ControlGroupContainer"]:has(#visibility-anchor-button)', add, {signal});
	observe('form:has(.octicon-info) [type=submit]', addOld, {signal});
	delegate('form', 'submit', setStorage, {signal, capture: true});
}

void features.add(import.meta.url, {
	include: [
		isNewRepo,
		isNewRepoTemplate,
		isForkingRepo,
	],
	requiresToken: true,
	init,
}, {
	include: [
		() => Boolean(sessionStorage.rghNewRepo),
	],
	init: onetime(disableWikiAndProjectsOnce),
});

/*

Test URLs:

https://github.com/new
https://github.com/new?template_name=browser-extension-template&template_owner=fregante

*/
