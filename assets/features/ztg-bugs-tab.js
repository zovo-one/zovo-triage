import elementReady from '../npm/ztg-element-ready.js';
import { hasRepoHeader, isRepoIssueList, isIssue, isRepoTaxonomyIssueOrPRList } from '../npm/ztg-github-url-detection.js';
import BugIcon from '../npm/ztg-octicons-plain-react-components-Bug.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { writable } from '../npm/ztg-svelte-store-shared.js';
import '../npm/ztg-webext-storage-cache.js';
import features from '../ztg-feature-manager.js';
import api from '../github-helpers/ztg-api.js';
import isBugLabel from '../github-helpers/ztg-bugs-label.js';
import { cacheByRepo, buildRepoUrl } from '../github-helpers/ztg-index.js';
import SearchQuery from '../github-helpers/ztg-search-query.js';
import { addTab } from '../components/ztg-extensible-nav-store.js';
import onetime from '../helpers/ztg-onetime.js';
import CountBugs from './ztg-bugs-tab.gql.js';
import CachedFunction from '../npm/ztg-webext-storage-cache-cached-function.js';

async function countBugs() {
	const {repository} = await api.v4(CountBugs) ;
	const bugTypeCount = repository.issues.totalCount;

	let label = repository.labels.nodes.find(({name}) => name === 'bug');
	label ??= repository.labels.nodes.find(({name}) => isBugLabel(name));

	// Label might not be found if the repo uses a non-standard bug label name
	const bugLabelCount = label?.issues.totalCount ?? 0;
	const bugCount = Math.max(bugTypeCount, bugLabelCount);

	// Label might not be found if the repo uses a non-standard bug label name
	return {label: label?.name ?? 'bug', count: bugCount};
}

const bugs = new CachedFunction('bugs', {
	updater: countBugs,
	maxAge: {minutes: 30},
	staleWhileRevalidate: {days: 4},
	cacheKey: cacheByRepo,
});

async function getBugsLabel() {
	const {label} = await bugs.getCached() ?? {};
	return label ?? 'bug';
}

function getFullSearchQuery(bugsLabel) {
	return `(label:${bugsLabel} OR type:Bug)`;
}

async function isBugsListing() {
	const query = SearchQuery.from(location);
	const bugsLabel = await getBugsLabel();
	return query.includes(`label:${bugsLabel}`) || query.includes(getFullSearchQuery(bugsLabel));
}

async function addBugsTabOnce() {
	// Query API as early as possible, even if it's not necessary on archived repos
	const bugsPromise = bugs.get();

	// On a label:bug listing:
	// - always show the tab, as soon as possible
	// - update the count later
	// On other pages:
	// - only show the tab if needed
	if (!(await isBugsListing())) {
		const {count} = await bugsPromise;
		if (count === 0) {
			return false;
		}
	}

	const {href} = new SearchQuery(buildRepoUrl('issues'))
		.append(getFullSearchQuery(await getBugsLabel()));

	const counter = writable();
	addTab({
		id: 'rgh-bugs',
		href,
		label: 'Bugs',
		icon: BugIcon,
		counter,
		// eslint-disable-next-line @typescript-eslint/no-use-before-define -- TODO later, smaller diff now
		selected: isBugsTabSelected,
	}, 'pull-requests');

	// Update bugs count
	try {
		const {count: bugCount} = await bugsPromise;
		counter.set(bugCount);
	} catch (error) {
		counter.set(undefined);
		throw error; // Likely an API call error that will be handled by the init
	}
}

async function removePinnedIssues() {
	// TODO: Move to CSS, but it needs to be removed when the user navigates away from the bugs tab
	const pinnedIssues = await elementReady('ul[class*="PinnedIssues-module__area"]', {
		waitForChildren: false,
		stopOnDomReady: false,
		signal: AbortSignal.timeout(1000),
	});

	// The repo might not have any pinned issues
	pinnedIssues?.remove();
}

async function isBugsTabSelected() {
	// Early return when it's certain that it's not selected.
	// This avoids delaying the `selected` check for other tabs.
	if (!isRepoIssueList() && !isIssue()) {
		return false;
	}

	const {count, label} = await bugs.get();
	if (count === 0) {
		return false;
	}

	if (
		(isRepoTaxonomyIssueOrPRList() && location.pathname.endsWith('/labels/' + encodeURIComponent(label)))
		|| (isRepoIssueList() && (await isBugsListing()))
	) {
		// TODO: eh. This side effect should be moved
		void removePinnedIssues();
		return true;
	}

	return isIssue() && Boolean(await elementReady(`#partial-discussion-sidebar .IssueLabel[data-name="${label}"]`));
}

void features.add(import.meta.url, {
	asLongAs: [
		hasRepoHeader,
		// Some repos may disable issues altogether
		() => Boolean(elementReady('li[data-tab-item="issues"]', {waitForChildren: false})),
	],
	requiresToken: true,
	init: onetime(addBugsTabOnce),
});

/*

Test URLs:

- label:bug https://github.com/refined-github/refined-github/issues
- label:"Type: Bug" https://github.com/react/react/issues
- type:Bug: https://github.com/keepassxreboot/keepassxc/issues
- Issues disabled: https://github.com/refined-github/yolo

*/
