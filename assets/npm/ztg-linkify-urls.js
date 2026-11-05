import createHtmlElement from './ztg-create-html-element.js';
import { processUrlParts, parseUrl } from './ztg-linkify-urls-utilities.js';

const parseValue = (value, href) => {
	switch (typeof value) {
		case 'function': {
			return {html: value(href)};
		}
		case 'undefined': {
			return {text: href};
		}
		default: {
			return {html: value};
		}
	}
};
function linkify(url, options = {}) {
	const {href, punctuation} = parseUrl(url);
	return createHtmlElement({
		name: 'a',
		attributes: {
			href,
			...options.attributes,
			href,
		},
		...parseValue(options.value, href),
	}) + punctuation;
}
const domify = html => document.createRange().createContextualFragment(html);
function linkifyUrlsToDom(string, options) {
	const fragment = document.createDocumentFragment();
	const renderer = {
		link: (url, options) => domify(linkify(url, options)),
		text: text => text,
	};
	const results = processUrlParts(string, options, renderer);
	for (const result of results) {
		fragment.append(result);
	}
	return fragment;
}

export { linkifyUrlsToDom };
