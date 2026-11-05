import doma from '../npm/ztg-doma.js';
import memoize from '../npm/ztg-memoize.js';
import { $optional } from '../npm/ztg-select-dom.js';
import { log } from './ztg-feature-helpers.js';

async function fetchDom(url, selector) {
	log.http(url);
	const absoluteUrl = new URL(url, location.origin).href; // Firefox `fetch`es from the content script, so relative URLs fail
	const response = await fetch(absoluteUrl);
	const dom = doma(await response.text());
	if (selector) {
		return $optional(selector, dom);
	}

	return dom;
}

var fetchDom$1 = memoize(fetchDom);

export { fetchDom$1 as default, fetchDom as fetchDomUncached };
