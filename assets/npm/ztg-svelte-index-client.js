import { untrack } from './ztg-svelte-internal-client-runtime.js';
export { tick } from './ztg-svelte-internal-client-runtime.js';
import { lifecycle_outside_component } from './ztg-svelte-internal-shared-errors.js';
import { legacy_mode_flag } from './ztg-svelte-internal-flags.js';
import { component_context } from './ztg-svelte-internal-client-context.js';
import './ztg-svelte-internal-client-constants.js';
import { user_effect } from './ztg-svelte-internal-client-reactivity-effects.js';
import './ztg-svelte-internal-client-dom-reconciler.js';
import './ztg-svelte-internal-client-dom-elements-custom-element.js';

function onMount(fn) {
	if (component_context === null) {
		lifecycle_outside_component();
	}
	if (legacy_mode_flag && component_context.l !== null) {
		init_update_callbacks(component_context).m.push(fn);
	} else {
		user_effect(() => {
			const cleanup = untrack(fn);
			if (typeof cleanup === 'function') return  (cleanup);
		});
	}
}
function init_update_callbacks(context) {
	var l =  (context).l;
	return (l.u ??= { a: [], b: [], m: [] });
}

export { onMount, untrack };
