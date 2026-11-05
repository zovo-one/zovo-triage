import React from '../npm/ztg-dom-chef.js';
import { isPRCommit404, isCommit, isPR } from '../npm/ztg-github-url-detection.js';
import DiffIcon from '../npm/ztg-octicons-plain-react-components-Diff.js';
import features from '../ztg-feature-manager.js';
import { getCleanPathname } from '../github-helpers/ztg-index.js';
import observe from '../helpers/ztg-selector-observer.js';

function getPrUrl(extension) {
	const pathname = getCleanPathname();
	const [owner, repo, , id] = pathname.split('/', 4);
	return `/${owner}/${repo}/pull/${id}.${extension}`;
}

function getCommitUrl(extension) {
	// The replacement avoids a redirection isPRCommit
	const pathname = getCleanPathname().replace(/\/pull\/\d+\/commits/, '/commit');
	return `/${pathname}.${extension}`;
}

function updateCommitUrl(
	{currentTarget: link},
) {
	link.href = getCommitUrl(link.textContent );
}

function createLink(type) {
	return (
		React.createElement('a', {
			href: getCommitUrl(type),
			className: "sha color-fg-default" ,
			// Update URL because it might be out of date due to SPA navigation
			// https://github.com/refined-github/refined-github/issues/8737
			onMouseEnter: updateCommitUrl,
			onFocus: updateCommitUrl,}

, type
)
	);
}

async function addPatchDiffLinks(commitMeta) {
	commitMeta.classList.remove('no-wrap'); // #5987
	commitMeta.prepend(
		React.createElement('span', { className: "sha-block", 'data-turbo': "false",}
, createLink('patch'), " " , createLink('diff')
, commitMeta.tagName !== 'DIV' && React.createElement('span', { className: "px-2 tmp-px-2" ,}, "·")
),
	);
}

async function addPrPatchDiffLinks(prHeader) {
	prHeader.append(
		React.createElement('li', { className: "Box-row p-3 tmp-p-3 mt-0 tmp-mt-0 d-flex flex-items-center"      ,}
, React.createElement(DiffIcon, { className: "mr-2 tmp-mr-2" ,} )
, React.createElement('div', { 'data-turbo': "false",}
, React.createElement('span', { className: "text-bold",}, 'Git URLs: ')
, React.createElement('a', { href: getPrUrl('patch'),}, "patch")
, ' · '
, React.createElement('a', { href: getPrUrl('diff'),}, "diff")
)
),
	);
}

async function init(signal) {
	observe(
		[
			'.commit-meta > :is(span, div):last-child', // `isPRCommit` + old `isSingleCommit`
			'[class*="commit-header-actions"] + div pre',
		],
		addPatchDiffLinks,
		{signal},
	);

	observe(
		[
			'.react-overview-code-button-action-list > ul',
			'#local-panel > ul', // TODO [2027-01-01]: Drop after legacy PR files view is removed
		],
		addPrPatchDiffLinks,
		{signal},
	);
}

void features.add(import.meta.url, {
	include: [
		isCommit,
		isPR,
	],
	exclude: [
		isPRCommit404,
	],
	init,
});

/*

Test URLs:

- Commit:https://github.com/refined-github/refined-github/commit/132272786fdc058193e089d8c06f2a158844e101
- PR Commit: https://github.com/refined-github/refined-github/pull/7751/commits/07ddf838c211075701e9a681ab061a158b05ee79
- PR: https://github.com/refined-github/refined-github/pull/7751

*/
