function removeHashFromUrlBar() {
	const url = new URL(location.href);
	url.hash = '';
	history.replaceState(history.state, '', url.href);
}

export { removeHashFromUrlBar as default };
