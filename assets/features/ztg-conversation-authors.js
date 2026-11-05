import { isRepoIssueList, isIssueOrPRList } from '../npm/ztg-github-url-detection.js';
import '../npm/ztg-webext-storage-cache.js';
import features from '../ztg-feature-manager.js';
import api from '../github-helpers/ztg-api.js';
import { cacheByRepo, getLoggedInUser } from '../github-helpers/ztg-index.js';
import observe from '../helpers/ztg-selector-observer.js';
import GetCollaborators from './ztg-conversation-authors.gql.js';
import CachedFunction from '../npm/ztg-webext-storage-cache-cached-function.js';
import { assertError } from '../npm/ztg-ts-extras-assert-error.js';

const collaborators = new CachedFunction('repo-collaborators', {
	async updater() {
		try {
			const {repository} = await api.v4(GetCollaborators);
			return repository.collaborators.nodes.map((user) => user.login);
		} catch (error) {
			assertError(error);
			if (error.message.includes('You do not have permission to view repository collaborators')) {
				return [];
			}

			throw error;
		}
	},
	maxAge: {days: 1},
	staleWhileRevalidate: {days: 20},
	cacheKey: cacheByRepo,
});

async function highlightCollaborators(signal) {
	const list = await collaborators.get();
	observe('a[class^="IssueItem-module__authorCreatedLink"]', author => {
		const name = author.textContent.trim();
		if (list.includes(name) && name !== getLoggedInUser()) {
			author.classList.add('rgh-collaborator');
		}
	}, {signal});
}

function highlightSelf(signal) {
	// "Opened by {user}" and "Created by {user}"
	observe([
		// TODO [2027-01-01]: Drop after the legacy PR Files view is gone
		`.opened-by a[title$="ed by ${CSS.escape(getLoggedInUser())}"]`,
		`a[class^="IssueItem-module__authorCreatedLink"][data-hovercard-url="/users/${
			CSS.escape(getLoggedInUser())
		}/hovercard"]`,
	], author => {
		author.classList.add('rgh-own-conversation');
	}, {signal});
}

void features.add(import.meta.url, {
	include: [
		isRepoIssueList,
	],
	requiresToken: true,
	init: highlightCollaborators,
}, {
	include: [
		isIssueOrPRList,
	],
	init: highlightSelf,
});

/*

Test URLs:

https://github.com/issues
https://github.com/refined-github/refined-github/issues

*/
