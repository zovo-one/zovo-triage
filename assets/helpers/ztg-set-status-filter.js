import SearchQuery from '../github-helpers/ztg-search-query.js';

function setStatusFilter(link, status) {
	const query = SearchQuery
		.from(link)
		.remove(
			'is:draft',
			'is:open',
			'is:closed',
			'state:draft',
			'state:open',
			'state:closed',
			'is:merged',
			'state:merged',
			'is:unmerged',
			'-state:merged',
		);

	return query.href;
}

export { setStatusFilter as default };
