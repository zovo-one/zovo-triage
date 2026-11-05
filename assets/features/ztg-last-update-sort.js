import { isIssueOrPRList, isRepoTaxonomyIssueOrPRList, isProjects } from '../npm/ztg-github-url-detection.js';
import oneEvent from '../npm/ztg-one-event.js';
import features from '../ztg-feature-manager.js';
import SearchQuery from '../github-helpers/ztg-search-query.js';
import { linksToConversationLists } from '../github-helpers/ztg-selectors.js';
import observe from '../helpers/ztg-selector-observer.js';
import { newIssueModalDeadLinks } from './ztg-new-tab-links.js';

/** Keep the original URL on the element so that `shorten-links` can use it reliably #5890 */
function saveOriginalHref(link) {
	link.dataset.originalHref ??= link.href;
}

async function updateLink(link) {
	if (link.host !== location.host) {
		return;
	}

	// Avoid conflict with `new-tab-links` in New Issue modal
	// https://github.com/refined-github/refined-github/pull/9640/changes#r3328459390
	if (link.matches(newIssueModalDeadLinks)) {
		return;
	}

	// Pick only links to lists, not single issues
	// + skip pagination links
	// + skip pr/issue filter dropdowns (some are lazyloaded)
	if (isIssueOrPRList(link)) {
		// Avoid rewriting /labels/ URLs until the last moment
		// https://github.com/refined-github/refined-github/issues/7205
		if (isRepoTaxonomyIssueOrPRList(link)) {
			await oneEvent(link, 'click', {filter: event => (event ).which < 2});
		}

		saveOriginalHref(link);

		const newUrl = SearchQuery.from(link).prepend('sort:updated-desc').href;

		// Preserve relative attributes as such #5435
		const isRelativeAttribute = link.getAttribute('href').startsWith('/');
		link.href = isRelativeAttribute ? newUrl.replace(location.origin, '') : newUrl;
	}

	// Also sort projects #4957
	if (isProjects()) {
		saveOriginalHref(link);

		// Projects use a different parameter name so don't use SearchQuery
		const search = new URLSearchParams(link.search);
		const query = search.get('query') ?? 'state:open'; // Default value query is missing
		search.set('query', `sort:updated-desc ${query}`);
		link.search = search.toString();
	}
}

function init(signal) {
	// Get links that don't already have a specific sorting or pagination applied
	observe(
		linksToConversationLists,
		updateLink,
		{signal},
	);
}

void features.add(import.meta.url, {
	init,
});

/*

Test URLs

Live links, these should be altered to include the `sort:updated-desc` query parameter:

- https://github.com/refined-github/refined-github/pulls
- https://github.com/refined-github/refined-github/labels/bug

*/

export { saveOriginalHref };
