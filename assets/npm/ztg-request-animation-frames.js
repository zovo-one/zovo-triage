function requestAnimationFrames() {
	const hasRaf = typeof globalThis.requestAnimationFrame === 'function';
	const requestFrame = hasRaf
		? globalThis.requestAnimationFrame
		: callback => setTimeout(() => callback(performance.now()), 16);
	const cancelFrame = hasRaf
		? globalThis.cancelAnimationFrame
		: id => clearTimeout(id);
	return {
		async * [Symbol.asyncIterator]() {
			let requestId;
			try {
				yield performance.now();
				await new Promise(resolve => {
					setTimeout(resolve, 1);
				});
				while (true) {
					yield await new Promise(resolve => {
						requestId = requestFrame(resolve);
					});
				}
			} finally {
				cancelFrame(requestId);
			}
		},
	};
}

export { requestAnimationFrames as default };
