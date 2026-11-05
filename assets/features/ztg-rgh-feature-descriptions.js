import delegate from '../npm/ztg-delegate-it-delegate.js';
import { isNewIssue } from '../npm/ztg-github-url-detection.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { mount, unmount } from '../npm/ztg-svelte-internal-client-render.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import features from '../ztg-feature-manager.js';
import { isRefinedGitHubRepo } from '../github-helpers/ztg-index.js';
import observe from '../helpers/ztg-selector-observer.js';
import { openInNewTab } from './ztg-prevent-comment-loss.js';
import Rgh_feature_descriptions from './ztg-rgh-feature-descriptions.svelte.js';
import singleton from '../helpers/ztg-singleton.js';

function addDescription(anchor) {
	const app = mount(Rgh_feature_descriptions, {target: anchor.parentElement, anchor});
	return () => {
		void unmount(app);
	};
}

// TODO: Remove this, duplicate in the svelte component
function getFeatureNameFromIssueTitle() {
	const title = new URLSearchParams(location.search).get('title') ?? '';
	// The title might be missing altogether
	return /^`(?<id>[^`]+)`/.exec(title)?.groups?.id;
}

function init(signal) {
	observe('#repos-sticky-header', singleton(addDescription), {signal});
}

function initIssueForm(signal) {
	observe('[data-testid="sidebar-assignees-section"]', addDescription, {signal});

	// Avoid form content loss
	delegate('.rgh-feature-description a', 'click', openInNewTab);
}

const featureUrlRegex = /^(?:[/]refined-github){2}[/]blob[/][^/]+[/]source[/]features[/][^.]+[.](?:tsx|css)$/;

void features.add(import.meta.url, {
	include: [
		() => featureUrlRegex.test(location.pathname),
	],
	init,
}, {
	asLongAs: [
		isRefinedGitHubRepo,
		isNewIssue,
		// TODO: detect `1_bug_report`, listen to title field changes
		() => Boolean(getFeatureNameFromIssueTitle()),
	],
	init: initIssueForm,
});

/*

## Test URLs

- Regular feature: https://github.com/refined-github/refined-github/blob/main/source/features/align-issue-labels.tsx
- CSS counterpart: https://github.com/refined-github/refined-github/blob/main/source/features/align-issue-labels.css
- CSS-only feature: https://github.com/refined-github/refined-github/blob/main/source/features/reactions-popup.css
- RGH feature: https://github.com/refined-github/refined-github/blob/main/source/features/rgh-feature-descriptions.css
- Removed feature: https://github.com/refined-github/refined-github/blob/55dfdfd903bd7d36e0c2f3dc46847bddc73544f5/source/features/latest-tag-button.tsx
- Bug report: https://github.com/refined-github/refined-github/issues/new?template=1_bug_report.yml&title=%60open-all-conversations%60%3A+Expected+elements
*/
