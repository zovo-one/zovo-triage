import { EFFECT_PRESERVED, DESTROYED, INERT, WAS_MARKED, DERIVED, DIRTY, STALE_REACTION, REACTION_RAN, ERROR_VALUE, CLEAN } from './ztg-svelte-internal-client-constants.js';
import { increment_write_version, update_effect, active_effect, set_active_effect, update_reaction, remove_reactions, push_reaction_value, is_destroying_effect, active_reaction } from './ztg-svelte-internal-client-runtime.js';
import { without_reactive_context } from './ztg-svelte-internal-client-dom-elements-bindings-shared.js';
import { equals, safe_equals } from './ztg-svelte-internal-client-reactivity-equality.js';
import { async_derived_orphan } from './ztg-svelte-internal-client-errors.js';
import { derived_inert } from './ztg-svelte-internal-client-warnings.js';
import { async_effect, teardown, destroy_effect, destroy_effect_children, effect_tracking } from './ztg-svelte-internal-client-reactivity-effects.js';
import { source, internal_set } from './ztg-svelte-internal-client-reactivity-sources.js';
import { noop, deferred } from './ztg-svelte-internal-shared-utils.js';
import { component_context } from './ztg-svelte-internal-client-context.js';
import { UNINITIALIZED } from './ztg-svelte-constants.js';
import { current_batch, previous_batch, batch_values } from './ztg-svelte-internal-client-reactivity-batch.js';
import { unset_context, increment_pending } from './ztg-svelte-internal-client-reactivity-async.js';
import { set_signal_status, update_derived_status } from './ztg-svelte-internal-client-reactivity-status.js';

function derived(fn) {
	var flags = DERIVED | DIRTY;
	if (active_effect !== null) {
		active_effect.f |= EFFECT_PRESERVED;
	}
	const signal = {
		ctx: component_context,
		deps: null,
		effects: null,
		equals,
		f: flags,
		fn,
		reactions: null,
		rv: 0,
		v:  (UNINITIALIZED),
		wv: 0,
		parent: active_effect,
		ac: null
	};
	return signal;
}
const OBSOLETE = Symbol('obsolete');
function async_derived(fn, label, location) {
	let parent =  (active_effect);
	if (parent === null) {
		async_derived_orphan();
	}
	var promise =  ( (undefined));
	var signal = source( (UNINITIALIZED));
	var should_suspend = !active_reaction;
	var deferreds = new Set();
	async_effect(() => {
		var effect =  (active_effect);
		var d = deferred();
		promise = d.promise;
		try {
			Promise.resolve(fn())
				.then(d.resolve, (e) => {
					if (e !== STALE_REACTION) d.reject(e);
				})
				.finally(unset_context);
		} catch (error) {
			d.reject(error);
			unset_context();
		}
		var batch =  (current_batch);
		if (should_suspend) {
			if ((effect.f & REACTION_RAN) !== 0) {
				var decrement_pending = increment_pending();
			}
			if (
				parent.b?.is_rendered()
			) {
				batch.async_deriveds.get(effect)?.reject(OBSOLETE);
			} else {
				for (const d of deferreds.values()) {
					d.reject(OBSOLETE);
				}
			}
			deferreds.add(d);
			batch.async_deriveds.set(effect, d);
		}
		const handler = (value, error = undefined) => {
			decrement_pending?.();
			deferreds.delete(d);
			if (error === OBSOLETE) return;
			batch.activate();
			if (error) {
				signal.f |= ERROR_VALUE;
				internal_set(signal, error);
			} else {
				if ((signal.f & ERROR_VALUE) !== 0) {
					signal.f ^= ERROR_VALUE;
				}
				internal_set(signal, value);
			}
			batch.deactivate();
		};
		d.promise.then(handler, (e) => handler(null, e || 'unknown'));
	});
	teardown(() => {
		for (const d of deferreds) {
			d.reject(OBSOLETE);
		}
	});
	return new Promise((fulfil) => {
		function next(p) {
			function go() {
				if (p === promise) {
					fulfil(signal);
				} else {
					next(promise);
				}
			}
			p.then(go, go);
		}
		next(promise);
	});
}
function user_derived(fn) {
	const d = derived(fn);
	push_reaction_value(d);
	return d;
}
function derived_safe_equal(fn) {
	const signal = derived(fn);
	signal.equals = safe_equals;
	return signal;
}
function destroy_derived_effects(derived) {
	var effects = derived.effects;
	if (effects !== null) {
		derived.effects = null;
		for (var i = 0; i < effects.length; i += 1) {
			destroy_effect( (effects[i]));
		}
	}
}
function execute_derived(derived) {
	var value;
	var prev_active_effect = active_effect;
	var parent = derived.parent;
	if (
		!is_destroying_effect &&
		parent !== null &&
		derived.v !== UNINITIALIZED &&
		(parent.f & (DESTROYED | INERT)) !== 0
	) {
		derived_inert();
		return derived.v;
	}
	set_active_effect(parent);
	{
		try {
			derived.f &= ~WAS_MARKED;
			destroy_derived_effects(derived);
			value = update_reaction(derived);
		} finally {
			set_active_effect(prev_active_effect);
		}
	}
	return value;
}
function update_derived(derived) {
	var value = execute_derived(derived);
	if (!derived.equals(value)) {
		derived.wv = increment_write_version();
		if (!current_batch?.is_fork || derived.deps === null) {
			if (current_batch !== null) {
				current_batch.capture(derived, value, true);
				previous_batch?.capture(derived, value, true);
			} else {
				derived.v = value;
			}
			if (derived.deps === null) {
				set_signal_status(derived, CLEAN);
				return;
			}
		}
	}
	if (is_destroying_effect) {
		return;
	}
	if (batch_values !== null) {
		if (effect_tracking() || current_batch?.is_fork) {
			batch_values.set(derived, value);
		}
	} else {
		update_derived_status(derived);
	}
}
function freeze_derived_effects(derived) {
	if (derived.effects === null) return;
	for (const e of derived.effects) {
		if (e.teardown || e.ac) {
			e.teardown?.();
			if (e.ac !== null) {
				without_reactive_context(() => {
					 (e.ac).abort(STALE_REACTION);
					e.ac = null;
				});
			}
			if (e.fn !== null) e.teardown = noop;
			remove_reactions(e, 0);
			destroy_effect_children(e);
		}
	}
}
function unfreeze_derived_effects(derived) {
	if (derived.effects === null) return;
	for (const e of derived.effects) {
		if (e.teardown && e.fn !== null) {
			update_effect(e);
		}
	}
}

export { OBSOLETE, async_derived, derived, derived_safe_equal, destroy_derived_effects, execute_derived, freeze_derived_effects, unfreeze_derived_effects, update_derived, user_derived };
