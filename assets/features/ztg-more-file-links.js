import delegate from '../npm/ztg-delegate-it-delegate.js';
import React from '../npm/ztg-dom-chef.js';
import { hasFiles } from '../npm/ztg-github-url-detection.js';
import FileCodeIcon from '../npm/ztg-octicons-plain-react-components-FileCode.js';
import HistoryIcon from '../npm/ztg-octicons-plain-react-components-History.js';
import VersionsIcon from '../npm/ztg-octicons-plain-react-components-Versions.js';
import { $ } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import GitHubFileUrl from '../github-helpers/ztg-github-file-url.js';

function getLegacyMenuItem(viewFile, name, route) {
	const {href} = new GitHubFileUrl(viewFile.href).assign({route});
	return (
		React.createElement('a', { href: href, 'data-turbo': String(route !== 'raw'), className: "pl-5 tmp-pl-5 dropdown-item btn-link"   , role: "menuitem",}, "View "
 , name
)
	);
}

function handleLegacyMenuOpening({delegateTarget: dropdown}) {
	dropdown.classList.add('rgh-more-file-links'); // Mark this as processed

	const viewFile = $('a[data-ga-click^="View file"]', dropdown);
	viewFile.after(
		getLegacyMenuItem(viewFile, 'raw', 'raw'),
		getLegacyMenuItem(viewFile, 'blame', 'blame'),
		getLegacyMenuItem(viewFile, 'history', 'commits'),
		React.createElement('div', { className: "dropdown-divider", role: "none",} ),
	);
}

function getMenuItem(viewFile, name, route, icon) {
	const menuItem = viewFile.cloneNode(true);
	const fileLink = $('a', viewFile).href;
	const link = $('a', menuItem);
	link.href = new GitHubFileUrl(fileLink).assign({route}).href;
	link.dataset.turbo = String(route !== 'raw');
	link.removeAttribute('aria-labelledby');
	$('[class^="prc-ActionList-ItemLabel"]', menuItem).textContent = `View ${name}`;
	$('[class^="prc-ActionList-LeadingVisual"]', menuItem).replaceChildren(icon);
	return menuItem;
}

function handleMenuOpening({delegateTarget: menuButton}) {
	// Don't run if the menu has been closed
	if (menuButton.ariaExpanded === 'false') {
		return;
	}

	// Wait for the menu DOM to be created, but not rendered
	requestAnimationFrame(() => {
		const viewFile = $('[class^="prc-ActionList-ActionListItem"]:has(.octicon-eye)');
		const {nextElementSibling} = viewFile;
		viewFile.after(
			getMenuItem(viewFile, 'raw', 'raw', React.createElement(FileCodeIcon, null )),
			getMenuItem(viewFile, 'blame', 'blame', React.createElement(VersionsIcon, null )),
			getMenuItem(viewFile, 'history', 'commits', React.createElement(HistoryIcon, null )),
			!nextElementSibling || nextElementSibling.getAttribute('data-component') === 'ActionList.Divider'
				? ''
				: React.createElement('li', { className: "dropdown-divider", 'aria-hidden': "true", 'data-component': "ActionList.Divider",} ),
		);
	});
}

function init(signal) {
	delegate(
		'div[class^="DiffFileHeader-module__diff-file-header"] button:has(>.octicon-kebab-horizontal)',
		'click',
		handleMenuOpening,
		{signal},
	);
	delegate(
		'.file-header .js-file-header-dropdown:not(.rgh-more-file-links)',
		'toggle',
		handleLegacyMenuOpening,
		// `capture: true` required to be fired before GitHub's handlers
		{capture: true, signal},
	);
}

void features.add(import.meta.url, {
	include: [
		hasFiles,
	],
	init,
});

/*

Test URLs:
https://github.com/refined-github/sandbox/pull/55/changes
https://github.com/refined-github/sandbox/compare/41c25160f0f574b302d72652ac83f4b2dab47e19...770d2ad5f086371da8a5f078f4267e6847e649f5
https://github.com/refined-github/sandbox/commit/0504e7dccb40374c24c1217f37d3579993d6071e

*/
