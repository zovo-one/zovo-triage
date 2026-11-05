import delegate from '../npm/ztg-delegate-it-delegate.js';
import { isAlteredClick } from '../npm/ztg-filter-altered-clicks.js';

function isMiddleClick(event) {
	return event.button === 1;
}

function onAlteredClick(
	selector,
	callback,
	options,
) {
	const clickListener = event => {
		if (isAlteredClick(event)) {
			callback(event);
		}
	};

	const auxClickListener = event => {
		if (isMiddleClick(event)) {
			callback(event);
		}
	};

	const preventAutoScrolling = (event) => {
		if (isMiddleClick(event)) {
			event.preventDefault();
		}
	};

	delegate(selector, 'click', clickListener, {capture: true, ...options});
	delegate(selector, 'auxclick', auxClickListener, {capture: true, ...options});
	delegate(selector, 'mousedown', preventAutoScrolling, {...options, capture: true});
}

export { onAlteredClick as default };
