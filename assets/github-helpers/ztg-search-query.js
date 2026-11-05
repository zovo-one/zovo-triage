const queryPartsRegExp = /[^\s"()]+:[^\s"()]*(?:"[^"]*")?|\([^)]*\)|"[^"]*"|[^\s"():]+/g;
const labelLinkRegex = /^(?:\/[^/]+){2}\/labels\/(?<label>[^/]+)\/?$/;

function splitQueryString(query) {
	return query.match(queryPartsRegExp) ?? [];
}

// Remove all keywords from array except the last occurrence of one of the keywords.
function deduplicateKeywords(array, ...keywords) {
	const deduplicated = [];
	let wasKeywordFound = false;
	for (const current of array.toReversed()) {
		const isKeyword = keywords.includes(current);
		if (!isKeyword || !wasKeywordFound) {
			deduplicated.unshift(current);
			wasKeywordFound ||= isKeyword;
		}
	}

	return deduplicated;
}

function cleanQueryParts(parts) {
	return deduplicateKeywords(parts, 'is:issue', 'is:pr');
}



/**
Parser/Mutator of GitHub's search query directly on anchors and URL-like objects.
Notice: if the <a> or `location` changes outside SearchQuery, `get()` will return an outdated value.
*/
class SearchQuery {
	static escapeValue(value) {
		return value.includes(' ') ? `"${value}"` : value;
	}

	static from(source) {
		if (source instanceof Location || source instanceof HTMLAnchorElement) {
			return new SearchQuery(source.href);
		}

		const url = new URL('https://github.com');
		for (const [name, value] of Object.entries(source)) {
			url.searchParams.set(name, value);
		}

		return new SearchQuery(url);
	}

	  url;
	 queryParts;

	constructor(url, base) {
		this.url = typeof url === 'string' ? new URL(url, base) : url;
		this.queryParts = [];

		const currentQuery = this.url.searchParams.get('q');
		if (typeof currentQuery === 'string') {
			this.queryParts = splitQueryString(currentQuery);
			return;
		}

		// Parse label links #5176
		const labelName = labelLinkRegex.exec(this.url.pathname)?.groups?.label;
		if (labelName) {
			this.queryParts = ['state:open', 'label:' + SearchQuery.escapeValue(decodeURIComponent(labelName))];
			return;
		}

		// Query-less URLs imply some queries.
		// When we explicitly set ?q=* they're overridden, so they need to be manually added again.

		// Repo example: is:issue state:open
		this.queryParts.push(/\/pulls\/?$/.test(this.url.pathname) ? 'is:pr' : 'is:issue', 'state:open');

		// Header nav example: state:open is:issue author:you archived:false
		if (this.url.pathname === '/issues' || this.url.pathname === '/pulls') {
			if (this.url.searchParams.has('user')) { // #1211
				this.queryParts.push('user:' + this.url.searchParams.get('user'));
			} else {
				this.queryParts.push('author:@me');
			}

			this.queryParts.push('archived:false');
		}
	}

	getQueryParts() {
		return cleanQueryParts(this.queryParts);
	}

	get() {
		return this.getQueryParts().join(' ');
	}

	set(query) {
		this.queryParts = splitQueryString(query);
		return this;
	}

	get searchParams() {
		return this.url.searchParams;
	}

	get href() {
		this.url.searchParams.set('q', this.get() + ' ');
		if (labelLinkRegex.test(this.url.pathname)) {
			// Avoid a redirection to the conversation list that would drop the search query #5176
			this.url.pathname = this.url.pathname.replace(/\/labels\/.+$/, '/issues');
		}

		return this.url.href;
	}

	edit(callback) {
		this.queryParts = callback(this.getQueryParts());
		return this;
	}

	replace(searchValue, replaceValue) {
		this.set(this.get().replace(searchValue, replaceValue));
		return this;
	}

	remove(...queryPartsToRemove) {
		this.queryParts = this.getQueryParts().filter(queryPart => !queryPartsToRemove.includes(queryPart));
		return this;
	}

	append(...queryPartsToAdd) {
		this.queryParts.push(...queryPartsToAdd);
		return this;
	}

	prepend(...queryPartsToAdd) {
		this.queryParts.unshift(...queryPartsToAdd);
		return this;
	}

	includes(...searchStrings) {
		return this.getQueryParts().some(queryPart => searchStrings.includes(queryPart));
	}
}

export { SearchQuery as default };
