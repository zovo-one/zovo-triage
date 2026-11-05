import { DESTROYING, STATE_SYMBOL } from './ztg-svelte-internal-client-constants.js';
import { component_context } from './ztg-svelte-internal-client-context.js';
import { effect, render_effect } from './ztg-svelte-internal-client-reactivity-effects.js';
import { untrack, active_effect } from './ztg-svelte-internal-client-runtime.js';

function is_bound_this(bound_value, element_or_component) {
	return (
		bound_value === element_or_component || bound_value?.[STATE_SYMBOL] === element_or_component
	);
}
function bind_this(element_or_component = {}, update, get_value, get_parts) {
	var component_effect =  (component_context).r;
	var parent =  (active_effect);
	effect(() => {
		var old_parts;
		var parts;
		render_effect(() => {
			old_parts = parts;
			parts = [];
			untrack(() => {
				if (!is_bound_this(get_value(...parts), element_or_component)) {
					update(element_or_component, ...parts);
					if (old_parts && is_bound_this(get_value(...old_parts), element_or_component)) {
						update(null, ...old_parts);
					}
				}
			});
		});
		return () => {
			let p = parent;
			while (p !== component_effect && p.parent !== null && p.parent.f & DESTROYING) {
				p = p.parent;
			}
			const teardown = () => {
				if (parts && is_bound_this(get_value(...parts), element_or_component)) {
					update(null, ...parts);
				}
			};
			const original_teardown = p.teardown;
			p.teardown = () => {
				teardown();
				original_teardown?.();
			};
		};
	});
	return element_or_component;
}

export { bind_this };
