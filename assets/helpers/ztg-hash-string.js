function hashString(string) {
	let hash = 0;

	for (const character of string) {
		// eslint-disable-next-line no-bitwise -- Low-level hash function
		hash = ((hash << 5) - hash) + character.codePointAt(0);
	}

	return String(Math.trunc(hash));
}

export { hashString as default };
