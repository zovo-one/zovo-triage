function getTextNodes(element) {
	const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
	const nodes = [];
	let node;

	do {
		node = walker.nextNode();
		if (node) {
			nodes.push(node );
		}
	} while (node);

	return nodes;
}

export { getTextNodes as default };
