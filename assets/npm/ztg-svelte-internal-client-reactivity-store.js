import { subscribe_to_store } from './ztg-svelte-store-utils.js';
import { get } from './ztg-svelte-store-shared.js';
import { noop, define_property } from './ztg-svelte-internal-shared-utils.js';
import { get as get$1 } from './ztg-svelte-internal-client-runtime.js';
import { teardown } from './ztg-svelte-internal-client-reactivity-effects.js';
import { mutable_source, set } from './ztg-svelte-internal-client-reactivity-sources.js';

let is_store_binding = false;
let IS_UNMOUNTED = Symbol('unmounted');
function store_get(store, store_name, stores) {
	const entry = (stores[store_name] ??= {
		store: null,
		source: mutable_source(undefined),
		unsubscribe: noop
	});
	if (entry.store !== store && !(IS_UNMOUNTED in stores)) {
		entry.unsubscribe();
		entry.store = store ?? null;
		if (store == null) {
			entry.source.v = undefined;
			entry.unsubscribe = noop;
		} else {
			var is_synchronous_callback = true;
			entry.unsubscribe = subscribe_to_store(store, (v) => {
				if (is_synchronous_callback) {
					entry.source.v = v;
				} else {
					set(entry.source, v);
				}
			});
			is_synchronous_callback = false;
		}
	}
	if (store && IS_UNMOUNTED in stores) {
		return get(store);
	}
	return get$1(entry.source);
}
function setup_stores() {
	const stores = {};
	function cleanup() {
		teardown(() => {
			for (var store_name in stores) {
				const ref = stores[store_name];
				ref.unsubscribe();
			}
			define_property(stores, IS_UNMOUNTED, {
				enumerable: false,
				value: true
			});
		});
	}
	return [stores, cleanup];
}
function capture_store_binding(fn) {
	var previous_is_store_binding = is_store_binding;
	try {
		is_store_binding = false;
		return [fn(), is_store_binding];
	} finally {
		is_store_binding = previous_is_store_binding;
	}
}

export { capture_store_binding, setup_stores, store_get };
