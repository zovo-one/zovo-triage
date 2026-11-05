import { onAbort } from '../npm/ztg-abort-utils-on-abort.js';

// TODO: Drop after https://github.com/fregante/abort-utils/issues/12
function abortableClassName(element, signal, ...classes) {
	element.classList.add(...classes);
	onAbort(signal, () => {
		element.classList.remove(...classes);
	});
}

export { abortableClassName as default };
