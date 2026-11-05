import { effect, render_effect } from './ztg-svelte-internal-client-reactivity-effects.js';
import { safe_not_equal } from './ztg-svelte-internal-client-reactivity-equality.js';
import { untrack, deep_read_state } from './ztg-svelte-internal-client-runtime.js';

function action(dom, action, get_value) {
	effect(() => {
		var payload = untrack(() => action(dom, get_value?.()) || {});
		if (get_value && payload?.update) {
			var inited = false;
			var prev =  ({});
			render_effect(() => {
				var value = get_value();
				deep_read_state(value);
				if (inited && safe_not_equal(prev, value)) {
					prev = value;
					 (payload.update)(value);
				}
			});
			inited = true;
		}
		if (payload?.destroy) {
			return () =>  (payload.destroy)();
		}
	});
}

export { action };
