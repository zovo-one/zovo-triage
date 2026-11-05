import elementReady from '../npm/ztg-element-ready.js';
import { isInitialLoad } from '../helpers/ztg-feature-helpers.js';
import { hasToken } from '../ztg-options-storage.js';
import api from './ztg-api.js';
import { getConversationNumber } from './ztg-index.js';
import GetIssueLockStatus from './ztg-is-conversation-locked.gql.js';

async function isConversationLockedViaApi() {
	if (!await hasToken()) {
		return undefined;
	}

	const {repository} = await api.v4uncached(GetIssueLockStatus, {
		variables: {
			number: getConversationNumber(),
		},
	});

	return repository.issueOrPullRequest.locked;
}

async function isConversationLockedViaDom() {
	// The form only appears to moderators
	const lockToggle = await elementReady([
		'.discussion-sidebar-item svg.octicon-key + strong', // PRs, old issues
		'[class^="Item__LiBox"]:has(svg.octicon-lock) [data-component="ActionList.Item--DividerContainer"] span', // Issues
	]);
	return lockToggle ? lockToggle.textContent === 'Unlock conversation' : undefined;
}

async function isConversationLockedViaReactData() {
	if (!isInitialLoad()) {
		return;
	}

	const data = await elementReady('[data-target="react-app.embeddedData"]');
	return data
		? JSON.parse(data.textContent).payload?.preloadedQueries?.[0].result.data.repository?.issue?.locked
		: undefined;
}

async function isConversationLocked() {
	// Like Promise.race, but it only resolves if the result is not undefined
	return new Promise(resolve => {
		const resolveIfDefined = async (check) => {
			const isLocked = await check();
			if (isLocked !== undefined) {
				resolve(isLocked);
			}
		};

		void resolveIfDefined(isConversationLockedViaReactData);
		void resolveIfDefined(isConversationLockedViaDom);
		void resolveIfDefined(isConversationLockedViaApi);
	});
}

export { isConversationLocked as default };
