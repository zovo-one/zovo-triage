function regular(single) {
	return single + 's';
}

function pluralize(
	count,
	single,
	plural = regular(single),
	zero,
) {
	if (count === 0 && zero) {
		return zero.replace('$$', '0');
	}

	if (count === 1) {
		return single.replace('$$', '1');
	}

	return plural.replace('$$', String(count));
}

export { pluralize as default };
