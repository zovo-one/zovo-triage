import { active_effect } from './ztg-svelte-internal-client-runtime.js';
import { create_user_effect } from './ztg-svelte-internal-client-reactivity-effects.js';
import { legacy_mode_flag } from './ztg-svelte-internal-flags.js';
import './ztg-svelte-internal-client-constants.js';

let component_context = null;
function set_component_context(context) {
	component_context = context;
}
function push(props, runes = false, fn) {
	component_context = {
		p: component_context,
		i: false,
		c: null,
		e: null,
		s: props,
		x: null,
		r:  (active_effect),
		l: legacy_mode_flag && !runes ? { s: null, u: null, $: [] } : null
	};
}
function pop(component) {
	var context =  (component_context);
	var effects = context.e;
	if (effects !== null) {
		context.e = null;
		for (var fn of effects) {
			create_user_effect(fn);
		}
	}
	if (component !== undefined) {
		context.x = component;
	}
	context.i = true;
	component_context = context.p;
	return component ??  ({});
}
function is_runes() {
	return !legacy_mode_flag || (component_context !== null && component_context.l === null);
}

export { component_context, is_runes, pop, push, set_component_context };
