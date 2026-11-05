async function pSome(iterable) {
	// eslint-disable-next-line no-async-promise-executor -- It's fine, resolve is at the end
	return new Promise(async resolve => {
		for (const promise of iterable) {
			(async () => {
				if (await promise) {
					resolve(true);
				}
			})();
		}

		await Promise.allSettled(iterable);

		resolve(false);
	});
}

async function pEvery(iterable) {
	const results = await Promise.all(iterable);
	return results.every(Boolean);
}

function pSomeFunction


(
	iterable,
	predicate,
) {
	const promises = [];
	// Prioritize sync functions and early returns
	for (const item of iterable) {
		const result = predicate(item );
		if (typeof result === 'boolean') {
			if (result) {
				// Early sync return on the first truthy value
				return true;
			}
		} else {
			promises.push(result);
		}
	}

	if (promises.length === 0) {
		// Matches `[].some(Boolean)`
		return false;
	}

	return pSome(promises);
}

function pEveryFunction


(
	iterable,
	predicate,
) {
	const promises = [];
	// Prioritize sync functions and early returns
	for (const item of iterable) {
		const result = predicate(item );
		if (typeof result === 'boolean') {
			if (!result) {
				// Early sync return on the first falsy value
				return false;
			}
		} else {
			promises.push(result);
		}
	}

	if (promises.length === 0) {
		// Matches `[].every(Boolean)`
		return true;
	}

	return pEvery(promises);
}

export { pEveryFunction, pSomeFunction };
