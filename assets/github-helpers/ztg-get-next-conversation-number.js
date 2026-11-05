import api from './ztg-api.js';

async function getNextConversationNumber() {
	const issues = await api.v3('issues?per_page=1');
	return (issues[0].number ) + 1;
}

export { getNextConversationNumber as default };
