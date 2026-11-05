import memoize from '../npm/ztg-memoize.js';

const onElementRemoval = memoize(async (element, signal) => {
	if (signal?.aborted) {
		return;
	}

	return new Promise(resolve => {
		const observer = new ResizeObserver(([{target}]) => {
			if (target.isConnected) {
				return;
			}

			observer.disconnect();
			resolve();
		});

		if (signal) {
			signal.addEventListener('abort', () => {
				observer.disconnect();
				resolve();
			}, {
				once: true,
			});
		}

		observer.observe(element);
	});
});

export { onElementRemoval as default };
