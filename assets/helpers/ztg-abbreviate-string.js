function abbreviateString(string, length) {
	return string.length < length
		? string
		: string.slice(0, length) + '…';
}

export { abbreviateString as default };
