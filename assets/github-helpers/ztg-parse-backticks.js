import React from '../npm/ztg-dom-chef.js';

const splittingRegex = /`` (?<double>.*?) ``|`(?<single>[^\n`]+)`/;

function getParsedBackticksParts(string) {
	return string.split(splittingRegex)
		.filter(part => part !== undefined); // Only one of the regexp's capture groups matches
}

function parseBackticks(description) {
	const fragment = new DocumentFragment();
	for (const [index, text] of getParsedBackticksParts(description).entries()) {
		if (index % 2 && text.length > 0) {
			// `span.sr-only` keeps the backticks copy-pastable but invisible
			fragment.append(
				React.createElement('span', { className: "sr-only",}, "`"),
				React.createElement('code', { className: "rgh-parse-backticks",}, text.trim()),
				React.createElement('span', { className: "sr-only",}, "`"),
			);
		} else if (text.length > 0) {
			fragment.append(text);
		}
	}

	return fragment;
}

export { parseBackticks as default, getParsedBackticksParts };
