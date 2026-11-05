import { hydrating, hydrate_next } from './ztg-svelte-internal-client-dom-hydration.js';

function slot(anchor, $$props, name, slot_props, fallback_fn) {
	if (hydrating) {
		hydrate_next();
	}
	var slot_fn = $$props.$$slots?.[name];
	var is_interop = false;
	if (slot_fn === true) {
		slot_fn = $$props['children' ];
		is_interop = true;
	}
	if (slot_fn === undefined) ; else {
		slot_fn(anchor, is_interop ? () => slot_props : slot_props);
	}
}

export { slot };
