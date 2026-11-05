import elementReady from '../npm/ztg-element-ready.js';
import { isRepo } from '../npm/ztg-github-url-detection.js';
import { $$, $optional, elementExists } from '../npm/ztg-select-dom.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { readable } from '../npm/ztg-svelte-store-shared.js';
import { mount } from '../npm/ztg-svelte-internal-client-render.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import AiModelIcon from '../npm/ztg-octicons-plain-react-components-AiModel.js';
import AgentIcon from '../npm/ztg-octicons-plain-react-components-Agent.js';
import BookIcon from '../npm/ztg-octicons-plain-react-components-Book.js';
import CodeIcon from '../npm/ztg-octicons-plain-react-components-Code.js';
import CommentDiscussionIcon from '../npm/ztg-octicons-plain-react-components-CommentDiscussion.js';
import GearIcon from '../npm/ztg-octicons-plain-react-components-Gear.js';
import GitPullRequestIcon from '../npm/ztg-octicons-plain-react-components-GitPullRequest.js';
import GitPullRequestLockedIcon from '../npm/ztg-octicons-plain-react-components-GitPullRequestLocked.js';
import GraphIcon from '../npm/ztg-octicons-plain-react-components-Graph.js';
import IssueOpenedIcon from '../npm/ztg-octicons-plain-react-components-IssueOpened.js';
import PlayIcon from '../npm/ztg-octicons-plain-react-components-Play.js';
import ShieldIcon from '../npm/ztg-octicons-plain-react-components-Shield.js';
import TableIcon from '../npm/ztg-octicons-plain-react-components-Table.js';
import features from '../ztg-feature-manager.js';
import { updateCurrentTab, setNativeTabs, selectTab } from '../components/ztg-extensible-nav-store.js';
import onetime from '../helpers/ztg-onetime.js';
import observe from '../helpers/ztg-selector-observer.js';
import Extensible_nav from './ztg-extensible-nav.svelte.js';
import { assertPresent } from '../npm/ztg-ts-extras-assert-present.js';

const knownTabsIcons = new Map([
	['code', CodeIcon],
	['issues', IssueOpenedIcon],
	['pull-requests', GitPullRequestIcon],
	['pull-requests-locked', GitPullRequestLockedIcon],
	['agents', AgentIcon],
	['actions', PlayIcon],
	['models', AiModelIcon],
	['wiki', BookIcon],
	['security-and-quality', ShieldIcon],
	['insights', GraphIcon],
	['settings', GearIcon],
	['discussions', CommentDiscussionIcon],
	['projects', TableIcon],
]);

function generateTab(item) {
	const label = ($optional('[data-component="text"]', item) ?? item).textContent;
	// Few items have counters. They can also be strings like "5k+" like in microsoft/vscode
	const counter = $optional('[data-component="counter"] [data-variant="secondary"]', item)?.textContent;

	// Hard assertions will make the feature fail before it attempts to replace the native one.
	// Being the repository's main navigation, we want to avoid breaking.
	const itemId = item.getAttribute('data-tab-item');
	assertPresent(itemId);

	// Some tabs swap their icon depending on state
	const lockedPrs = elementExists('[data-component="icon"] svg.octicon-git-pull-request-locked', item);
	const icon = knownTabsIcons.get(lockedPrs ? 'pull-requests-locked' : itemId);
	assertPresent(icon);

	// The tooltip lives in a sibling element, referenced via `aria-describedby`
	const describedBy = item.getAttribute('aria-describedby');
	// Few items have tooltips
	const tooltip = (describedBy && document.getElementById(describedBy)?.textContent) ?? undefined;

	return {
		id: itemId,
		href: item.href,
		reactNav: item.getAttribute('data-react-nav') ?? undefined,
		label,
		icon,
		counter: readable(counter),
		tooltip,
	};
}

function replace(nativeNav) {
	const items = $$('a', nativeNav);

	// Shouldn't be missing, but assert anyway
	const current = items
		.find(item => item.hasAttribute('aria-current'))
		?.getAttribute('data-tab-item');
	assertPresent(current);

	setNativeTabs(items.map(item => generateTab(item)));
	selectTab(current);

	mount(Extensible_nav, {target: nativeNav.parentElement});

	nativeNav.classList.add('rgh-extensible-nav-removed');
}

async function initOnce() {
	// Use `element-ready` to ensure that the native navigation is fully loaded before replacing it for the first time.
	await elementReady('.loaded nav[aria-label="Repository"]');

	// Use `observe` because GitHub occasionally removes and re-adds the entire header.
	observe('.loaded nav[aria-label="Repository"]', replace);
}

void features.add(import.meta.url, {
	include: [
		isRepo,
	],
	init: onetime(initOnce),
}, {
	include: [
		isRepo,
	],
	init: updateCurrentTab,
});

/*

Test URLs:

https://github.com/refined-github/refined-github
https://github.com/refined-github/refined-github/pulse
High counters https://github.com/microsoft/vscode
Blocked PRs https://github.com/sindresorhus/eslint-plugin-unicorn

*/
