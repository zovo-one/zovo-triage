import React from '../npm/ztg-dom-chef.js';
import { isRepoHome } from '../npm/ztg-github-url-detection.js';
import PlusIcon from '../npm/ztg-octicons-plain-react-components-Plus.js';
import TagIcon from '../npm/ztg-octicons-plain-react-components-Tag.js';
import { elementExists, $optional } from '../npm/ztg-select-dom.js';
import '../npm/ztg-webext-storage-cache.js';
import features from '../ztg-feature-manager.js';
import api from '../github-helpers/ztg-api.js';
import getDefaultBranch from '../github-helpers/ztg-get-default-branch.js';
import { userHasPushAccess } from '../github-helpers/ztg-get-user-permission.js';
import { groupButtons } from '../github-helpers/ztg-group-buttons.js';
import { cacheByRepo, getLatestVersionTag, getRepo, buildRepoUrl } from '../github-helpers/ztg-index.js';
import isDefaultBranch from '../github-helpers/ztg-is-default-branch.js';
import { branchSelector } from '../github-helpers/ztg-selectors.js';
import abbreviateString from '../helpers/ztg-abbreviate-string.js';
import { wrapAll } from '../helpers/ztg-dom-utils.js';
import pluralize from '../helpers/ztg-pluralize.js';
import observe from '../helpers/ztg-selector-observer.js';
import getPublishRepoState from './ztg-unreleased-commits.gql.js';
import CachedFunction from '../npm/ztg-webext-storage-cache-cached-function.js';

const undeterminableAheadBy = Number.MAX_SAFE_INTEGER; // For when the branch is ahead by more than 20 commits #5505

const repoPublishState = new CachedFunction('tag-ahead-by', {
	async updater() {
		const {repository} = await api.v4(getPublishRepoState);

		if (repository.refs.nodes.length === 0) {
			return {
				latestTag: false,
				aheadBy: 0,
			};
		}

		const tags = new Map();
		for (const node of repository.refs.nodes ) {
			// The commit might be missing on "lightweight" tags, so the code defaults to the tag.oid instead
			tags.set(node.name, node.tag.commit?.oid ?? node.tag.oid);
		}

		// If this logic ever gets dropped or becomes simpler, consider using the native "compare" API
		// https://github.com/refined-github/refined-github/issues/6094
		const latestTag = getLatestVersionTag([...tags.keys()]);
		const latestTagOid = tags.get(latestTag);
		const aheadBy = repository.defaultBranchRef.target.history.nodes.findIndex((node) =>
			node.oid === latestTagOid,
		);

		return {
			latestTag,
			aheadBy: aheadBy === -1 ? undeterminableAheadBy : aheadBy,
		};
	},
	maxAge: {hours: 1},
	staleWhileRevalidate: {days: 2},
	cacheKey: cacheByRepo,
});

async function createLink(
	latestTag,
	aheadBy,
) {
	const commitCount = aheadBy === undeterminableAheadBy
		? 'More than 20 unreleased commits'
		: pluralize(aheadBy, '$$ unreleased commit');
	const label = `${commitCount}\nsince ${abbreviateString(latestTag, 30)}`;

	return (
		React.createElement('a', {
			className: "btn px-2 tmp-px-2 tooltipped tooltipped-se"    ,
			href: buildRepoUrl('compare', `${latestTag}...${await getDefaultBranch()}`),
			'aria-label': label,}

, React.createElement(TagIcon, null )
, ' '
, aheadBy === undeterminableAheadBy || React.createElement('sup', { className: "ml-n2 tmp-ml-n2" ,}, "+", aheadBy)
)
	);
}

async function createLinkGroup(latestTag, aheadBy) {
	const link = await createLink(latestTag, aheadBy);
	if (!(await userHasPushAccess())) {
		return link;
	}

	return groupButtons([
		link,
		// `aria-label` wording taken from $user/$repo/releases page
		React.createElement('a', {
			href: buildRepoUrl('releases/new'),
			className: "btn px-2 tmp-px-2 tooltipped tooltipped-se"    ,
			'aria-label': "Draft a new release"   ,
			'data-turbo-frame': "repo-content-turbo-frame",}

, React.createElement(PlusIcon, null )
),
	]);
}

async function addToHome(branchSelectorElement) {
	// React issues. Duplicates appear after a color scheme update
	// https://github.com/refined-github/refined-github/issues/7536
	if (elementExists('.rgh-unreleased-commits-wrapper')) {
		return;
	}

	const {latestTag, aheadBy} = await repoPublishState.get();
	const isAhead = aheadBy > 0;

	if (!latestTag || !isAhead) {
		return;
	}

	const linkGroup = await createLinkGroup(latestTag, aheadBy);
	linkGroup.style.flexShrink = '0';

	wrapAll(
		React.createElement('div', { className: "d-flex gap-2 rgh-unreleased-commits-wrapper"  ,} ),
		branchSelectorElement,
		linkGroup,
	);
}

async function addToReleases(releasesFilter) {
	const {latestTag, aheadBy} = await repoPublishState.get();
	const isAhead = aheadBy > 0;

	if (!latestTag || !isAhead) {
		return;
	}

	const widget = await createLink(latestTag, aheadBy);

	// Prepend it to the existing "Draft a new release" button to match the button on the repo home
	const newReleaseButton = $optional('nav + div a[href$="/releases/new"]');
	if (newReleaseButton) {
		newReleaseButton.before(widget);
		groupButtons([
			widget,
			newReleaseButton,
		]);
		return;
	}

	// Otherwise, add it before filter input
	releasesFilter.form.before(widget);
	releasesFilter.form.parentElement.classList.add('d-flex', 'flex-items-start');
	// The form has .ml-md-2, this restores it on `sm`
	widget.classList.add('mr-md-0', 'mr-2');
}

async function addToNewRelease(header) {
	const {latestTag, aheadBy} = await repoPublishState.get();
	const isAhead = aheadBy > 0;

	if (!latestTag || !isAhead) {
		return;
	}

	const defaultBranch = await getDefaultBranch();

	header.append(
		' ',
		React.createElement('a', { target: "_blank", href: buildRepoUrl('compare', `${latestTag}...${defaultBranch}`),}
, pluralize(aheadBy, '$$ unreleased commit')
),
		` on ${defaultBranch} since `,
		React.createElement('a', { target: "_blank", href: buildRepoUrl('releases', latestTag),}
, abbreviateString(latestTag, 30)
),
	);
}

function initHome(signal) {
	observe(branchSelector, addToHome, {signal});
}

function initReleases(signal) {
	observe('input#release-filter', addToReleases, {signal});
}

function initNewRelease(signal) {
	observe('.js-tag-status-message[data-state="empty"]', addToNewRelease, {signal});
}

void features.add(import.meta.url, {
	asLongAs: [
		isDefaultBranch,
	],
	include: [
		isRepoHome,
	],
	requiresToken: true,
	init: initHome,
}, {
	include: [
		// Only first page of Releases
		() => getRepo()?.path === 'releases',
	],
	requiresToken: true,
	init: initReleases,
}, {
	include: [
		// Detections run on all pages, even not repos
		() => getRepo()?.path === 'releases/new',
	],
	requiresToken: true,
	init: initNewRelease,
});

/*

Test URLs

Repo with no tags (no button)
https://github.com/refined-github/yolo

Repo with too many unreleased commits
https://github.com/refined-github/sandbox

Repo with some unreleased commits
https://github.com/refined-github/refined-github

Releases page with unreleased commits
https://github.com/facebook/react/releases

Releases page with unreleased commits (user can release)
https://github.com/refined-github/refined-github/releases

Releases page with changelog file
https://github.com/fczbkk/css-selector-generator/releases

Realeasing a new version
https://github.com/refined-github/refined-github/releases/new

*/
