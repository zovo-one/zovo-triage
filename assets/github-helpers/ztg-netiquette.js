import toMilliseconds from '../npm/ztg-@sindresorhus-to-milliseconds.js';
import { isOpenConversation } from '../npm/ztg-github-url-detection.js';
import api from './ztg-api.js';
import { getConversationNumber } from './ztg-index.js';
import { assertDefined } from '../npm/ztg-ts-extras-assert-defined.js';

const threeMonths = toMilliseconds({days: 90});

async function getCloseDate() {
	if (isOpenConversation()) {
		return;
	}

	const {closed_at: closedAt} = await api.v3(`issues/${getConversationNumber()}`);
	assertDefined(closedAt, 'closed_at field is null');

	return new Date(closedAt);
}

function wasLongAgo(date) {
	return (Date.now() - date.getTime()) > threeMonths;
}

export { getCloseDate, wasLongAgo };
