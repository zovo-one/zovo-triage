import { run_all, run } from './ztg-svelte-internal-shared-utils.js';
import { component_context } from './ztg-svelte-internal-client-context.js';
import { derived } from './ztg-svelte-internal-client-reactivity-deriveds.js';
import { user_pre_effect, user_effect } from './ztg-svelte-internal-client-reactivity-effects.js';
import { untrack, get, deep_read_state } from './ztg-svelte-internal-client-runtime.js';

function init(immutable = false) {
	const context =  (component_context);
	const callbacks = context.l.u;
	if (!callbacks) return;
	let props = () => deep_read_state(context.s);
	if (immutable) {
		let version = 0;
		let prev =  ({});
		const d = derived(() => {
			let changed = false;
			const props = context.s;
			for (const key in props) {
				if (props[key] !== prev[key]) {
					prev[key] = props[key];
					changed = true;
				}
			}
			if (changed) version++;
			return version;
		});
		props = () => get(d);
	}
	if (callbacks.b.length) {
		user_pre_effect(() => {
			observe_all(context, props);
			run_all(callbacks.b);
		});
	}
	user_effect(() => {
		const fns = untrack(() => callbacks.m.map(run));
		return () => {
			for (const fn of fns) {
				if (typeof fn === 'function') {
					fn();
				}
			}
		};
	});
	if (callbacks.a.length) {
		user_effect(() => {
			observe_all(context, props);
			run_all(callbacks.a);
		});
	}
}
function observe_all(context, props) {
	if (context.l.s) {
		for (const signal of context.l.s) get(signal);
	}
	props();
}

export { init };
