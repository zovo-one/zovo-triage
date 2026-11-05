// eslint-disable-next-line @typescript-eslint/no-restricted-types -- Simplify passing random nodes
function looseParseInt(text) {
	if (!text) {
		return 0;
	}

	if (typeof text !== 'string') {
		text = text.textContent;
	}

	return Number(text.replaceAll(/\D+/g, ''));
}

export { looseParseInt as default };
