import elementReady from '../npm/ztg-element-ready.js';
import { isRepoIssueOrPRList } from '../npm/ztg-github-url-detection.js';
import { elementExists, $optional } from '../npm/ztg-select-dom.js';
import '../npm/ztg-webext-storage-cache.js';
import features from '../ztg-feature-manager.js';
import api from '../github-helpers/ztg-api.js';
import { expectTokenScope } from '../github-helpers/ztg-github-token.js';
import { cacheByRepo } from '../github-helpers/ztg-index.js';
import looseParseInt from '../helpers/ztg-loose-parse-int.js';
import observe from '../helpers/ztg-selector-observer.js';
import HasAnyProjects from './ztg-clean-conversation-filters.gql.js';
import CachedFunction from '../npm/ztg-webext-storage-cache-cached-function.js';

const hasAnyProjects = new CachedFunction('has-projects', {
	async updater() {
		const activeProjectsCounter = await elementReady('[data-hotkey="g b"] .Counter');
		if (looseParseInt(activeProjectsCounter) > 0) {
			return true;
		}

		const isOrganization = elementExists('[rel=author][data-hovercard-type="organization"]');
		if (!activeProjectsCounter && !isOrganization) {
			// No tab = Projects disabled in repo
			// No organization = no Projects in organization
			return false;
		}

		await expectTokenScope('read:project');
		const {repository, organization} = await api.v4(HasAnyProjects, {
			allowErrors: true,
		});

		return Boolean(repository.projectsV2.totalCount)
			// Joint query, both org and projects are optional
			|| Boolean(organization?.projectsV2?.totalCount);
	},
	maxAge: {days: 1},
	staleWhileRevalidate: {days: 20},
	cacheKey: cacheByRepo,
});

async function hideProjects(container) {
	const filter = $optional('[data-testid="projects-anchor-button"]', container);

	// If the filter is missing, then it has been disabled organization-wide already
	if (filter && !(await hasAnyProjects.get())) {
		filter.remove();
	}
}

async function hide(container) {
	// Keep separate so that one doesn't crash the other
	void hideProjects(container);
}

async function init(signal) {
	observe(String.raw`#\:rs\:-list-view-metadata`, hide, {signal});
}

void features.add(import.meta.url, {
	include: [
		isRepoIssueOrPRList,
	],
	requiresToken: true,
	init,
});

/*

Test URLs:

- No projects: https://github.com/left-pad/left-pad/issues
- Projects and milestones (no-op): https://github.com/tc39/ecma402/issues

*/
