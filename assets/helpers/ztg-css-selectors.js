function is(firstSelector, ...otherSelectors) {
	const selectors = Array.isArray(firstSelector) ? firstSelector : [firstSelector, ...otherSelectors];
	return `:is(${selectors.join(', ')})`;
}



function not(firstSelector, ...otherSelectors) {
	const selectors = Array.isArray(firstSelector) ? firstSelector : [firstSelector, ...otherSelectors];
	return `:not(${selectors.join(', ')})`;
}



function has(firstSelector, ...otherSelectors) {
	const selectors = Array.isArray(firstSelector) ? firstSelector : [firstSelector, ...otherSelectors];
	return `:has(${selectors.join(', ')})`;
}

export { has, is, not };
