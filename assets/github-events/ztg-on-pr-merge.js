import oneEvent from '../npm/ztg-delegate-it-one-event.js';
import { confirmMergeButton } from '../github-helpers/ztg-selectors.js';
import observe from '../helpers/ztg-selector-observer.js';

// This event ensures that the feature appears exclusively to the person that merged the PR and not anyone who was on the page at the time of the merge
async function waitForPrMerge(signal) {
	// It must start listening early or else the animation ID will be generated incorrectly (ancestor)
	// WARNING: Be very careful about the value of ancestor if you refactor this code
	const mergeEvent = new Promise(resolve => {
		// `emphasis` excludes merge commit icons added by `mark-merge-commits-in-list`
		observe('.TimelineItem-badge.color-fg-on-emphasis .octicon-git-merge', resolve, {ancestor: 4});
	});

	await oneEvent(confirmMergeButton, 'click', {signal});

	// It won't resolve once the signal is aborted
	await mergeEvent;

	if (signal.aborted) {
		throw new Error('The code shouldn’t have reached this point');
	}
}

export { waitForPrMerge as default };
