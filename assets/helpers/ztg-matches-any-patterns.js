/** Tests a target string against a list of strings (full match) or regexes (can be mixed) */
function matchesAnyPattern(
	target,
	patterns,
) {
	return patterns.some(pattern => {
		if (typeof pattern === 'string') {
			return pattern === target;
		}

		if (typeof pattern === 'function') {
			return pattern(target);
		}

		return pattern.test(target);
	});
}

export { matchesAnyPattern as default };
