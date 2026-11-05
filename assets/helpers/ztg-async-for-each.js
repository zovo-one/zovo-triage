/** Loop an iterable with the ability to place a non-blocking `await` in the loop itself */
async function asyncForEach(
	iterable,
	iteratee,
) {
	await Promise.all([...iterable].map(async item => iteratee(item)));
}

export { asyncForEach as default };
