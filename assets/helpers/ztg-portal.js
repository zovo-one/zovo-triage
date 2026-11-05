const portal = (node, getTarget) => {
	function move() {
		if (!node.isConnected) {
			// This is a requirement for `tool-tip`
			// https://github.com/refined-github/refined-github/pull/9668
			throw new Error('The element was not added to the document in time');
		}

		getTarget().append(node);
	}

	if (node.isConnected) {
		move();
	} else {
		queueMicrotask(move);
	}

	return {
		destroy() {
			node.remove();
		},
	};
};

export { portal as default };
