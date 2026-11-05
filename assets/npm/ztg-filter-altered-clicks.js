function filterAlteredClicks(callback, onlyPhysical) {
	return function (event) {
		event = event.originalEvent || event;
		if (isAlteredClick(event)) {
			return;
		}
		if (event.defaultPrevented) {
			return;
		}
		return callback.call(this, event);
	};
}
function isAlteredClick(event) {
	event = event.originalEvent || event;
	return (
		(event instanceof MouseEvent && event.which > 1)
		|| event.shiftKey
		|| event.altKey
		|| event.metaKey
		|| event.ctrlKey
	);
}

export { filterAlteredClicks as default, isAlteredClick };
