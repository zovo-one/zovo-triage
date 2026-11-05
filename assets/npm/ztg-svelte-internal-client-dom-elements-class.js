import { to_class } from './ztg-svelte-internal-shared-attributes.js';
import { CLASS_CACHE } from './ztg-svelte-internal-client-constants.js';
import { hydrating } from './ztg-svelte-internal-client-dom-hydration.js';

function set_class(dom, is_html, value, hash, prev_classes, next_classes) {
	var prev =  (dom)[CLASS_CACHE];
	if (
		hydrating ||
		prev !== value ||
		prev === undefined
	) {
		var next_class_name = to_class(value, hash, next_classes);
		if (!hydrating || next_class_name !== dom.getAttribute('class')) {
			if (next_class_name == null) {
				dom.removeAttribute('class');
			} else {
				dom.className = next_class_name;
			}
		}
		 (dom)[CLASS_CACHE] = value;
	} else if (next_classes && prev_classes !== next_classes) {
		for (var key in next_classes) {
			var is_present = !!next_classes[key];
			if (prev_classes == null || is_present !== !!prev_classes[key]) {
				dom.classList.toggle(key, is_present);
			}
		}
	}
	return next_classes;
}

export { set_class };
