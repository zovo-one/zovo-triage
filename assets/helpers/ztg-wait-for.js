import delay from './ztg-delay.js';

async function waitFor(condition) {
	while (!condition()) {
		// eslint-disable-next-line no-await-in-loop
		await delay(10);
	}
}

export { waitFor as default };
