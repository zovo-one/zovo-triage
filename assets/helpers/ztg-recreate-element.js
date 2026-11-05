function replaceElementTypeInPlace(
	oldElement,
	type,
) {
	const newElement = document.createElement(type);
	for (const {name, value} of oldElement.attributes) {
		newElement.setAttribute(name, value);
	}

	newElement.append(...oldElement.children);
	oldElement.replaceWith(newElement);
	return newElement;
}

export { replaceElementTypeInPlace as default };
