import DEV from './ztg-esm-env-false.js';
import { index_of, includes, get_prototype_of, get_descriptors } from './ztg-svelte-internal-shared-utils.js';
import { destroy_block_effect_children, destroy_effect_children, execute_effect_teardown, effect_tracking } from './ztg-svelte-internal-client-reactivity-effects.js';
import { CONNECTED, REACTION_RAN, ERROR_VALUE, DERIVED, DIRTY, MAYBE_DIRTY, DESTROYED, CLEAN, BRANCH_EFFECT, ROOT_EFFECT, BLOCK_EFFECT, MANAGED_EFFECT, STALE_REACTION, REACTION_IS_UPDATING, WAS_MARKED, STATE_SYMBOL } from './ztg-svelte-internal-client-constants.js';
import { old_values } from './ztg-svelte-internal-client-reactivity-sources.js';
import { update_derived, unfreeze_derived_effects, freeze_derived_effects, execute_derived } from './ztg-svelte-internal-client-reactivity-deriveds.js';
import { tracing_mode_flag } from './ztg-svelte-internal-flags.js';
import { UNINITIALIZED } from './ztg-svelte-constants.js';
import { set_component_context, is_runes, component_context } from './ztg-svelte-internal-client-context.js';
import { flushSync, batch_values, current_batch, schedule_effect } from './ztg-svelte-internal-client-reactivity-batch.js';
import { handle_error } from './ztg-svelte-internal-client-error-handling.js';
import { without_reactive_context } from './ztg-svelte-internal-client-dom-elements-bindings-shared.js';
import { set_signal_status, update_derived_status } from './ztg-svelte-internal-client-reactivity-status.js';

let is_updating_effect = false;
let is_destroying_effect = false;
function set_is_destroying_effect(value) {
	is_destroying_effect = value;
}
let active_reaction = null;
let untracking = false;
function set_active_reaction(reaction) {
	active_reaction = reaction;
}
let active_effect = null;
function set_active_effect(effect) {
	active_effect = effect;
}
let current_sources = null;
function push_reaction_value(value) {
	if (active_reaction !== null && (true)) {
		(current_sources ??= new Set()).add(value);
	}
}
let new_deps = null;
let skipped_deps = 0;
let untracked_writes = null;
function set_untracked_writes(value) {
	untracked_writes = value;
}
let write_version = 1;
let read_version = 0;
let update_version = read_version;
function set_update_version(value) {
	update_version = value;
}
function increment_write_version() {
	return ++write_version;
}
function is_dirty(reaction) {
	var flags = reaction.f;
	if ((flags & DIRTY) !== 0) {
		return true;
	}
	if (flags & DERIVED) {
		reaction.f &= ~WAS_MARKED;
	}
	if ((flags & MAYBE_DIRTY) !== 0) {
		var dependencies =  (reaction.deps);
		var length = dependencies.length;
		for (var i = 0; i < length; i++) {
			var dependency = dependencies[i];
			if (is_dirty( (dependency))) {
				update_derived( (dependency));
			}
			if (dependency.wv > reaction.wv) {
				return true;
			}
		}
		if (
			(flags & CONNECTED) !== 0 &&
			batch_values === null
		) {
			set_signal_status(reaction, CLEAN);
		}
	}
	return false;
}
function schedule_possible_effect_self_invalidation(signal, effect, root = true) {
	var reactions = signal.reactions;
	if (reactions === null) return;
	if (current_sources !== null && current_sources.has(signal)) {
		return;
	}
	for (var i = 0; i < reactions.length; i++) {
		var reaction = reactions[i];
		if ((reaction.f & DERIVED) !== 0) {
			schedule_possible_effect_self_invalidation( (reaction), effect, false);
		} else if (effect === reaction) {
			if (root) {
				set_signal_status(reaction, DIRTY);
			} else if ((reaction.f & CLEAN) !== 0) {
				set_signal_status(reaction, MAYBE_DIRTY);
			}
			schedule_effect( (reaction));
		}
	}
}
function update_reaction(reaction) {
	var previous_deps = new_deps;
	var previous_skipped_deps = skipped_deps;
	var previous_untracked_writes = untracked_writes;
	var previous_reaction = active_reaction;
	var previous_sources = current_sources;
	var previous_component_context = component_context;
	var previous_untracking = untracking;
	var previous_update_version = update_version;
	var flags = reaction.f;
	new_deps =  (null);
	skipped_deps = 0;
	untracked_writes = null;
	active_reaction = (flags & (BRANCH_EFFECT | ROOT_EFFECT)) === 0 ? reaction : null;
	current_sources = null;
	set_component_context(reaction.ctx);
	untracking = false;
	update_version = ++read_version;
	if (reaction.ac !== null) {
		without_reactive_context(() => {
			 (reaction.ac).abort(STALE_REACTION);
		});
		reaction.ac = null;
	}
	try {
		reaction.f |= REACTION_IS_UPDATING;
		var fn =  (reaction.fn);
		var result = fn();
		reaction.f |= REACTION_RAN;
		var deps = reaction.deps;
		var is_fork = current_batch?.is_fork;
		if (new_deps !== null) {
			var i;
			if (!is_fork) {
				remove_reactions(reaction, skipped_deps);
			}
			if (deps !== null && skipped_deps > 0) {
				deps.length = skipped_deps + new_deps.length;
				for (i = 0; i < new_deps.length; i++) {
					deps[skipped_deps + i] = new_deps[i];
				}
			} else {
				reaction.deps = deps = new_deps;
			}
			if (effect_tracking() && (reaction.f & CONNECTED) !== 0) {
				for (i = skipped_deps; i < deps.length; i++) {
					(deps[i].reactions ??= []).push(reaction);
				}
			}
		} else if (!is_fork && deps !== null && skipped_deps < deps.length) {
			remove_reactions(reaction, skipped_deps);
			deps.length = skipped_deps;
		}
		if (
			is_runes() &&
			untracked_writes !== null &&
			!untracking &&
			deps !== null &&
			(reaction.f & (DERIVED | MAYBE_DIRTY | DIRTY)) === 0
		) {
			for (i = 0; i <  (untracked_writes).length; i++) {
				schedule_possible_effect_self_invalidation(
					untracked_writes[i],
					 (reaction)
				);
			}
		}
		if (previous_reaction !== null && previous_reaction !== reaction) {
			read_version++;
			if (previous_reaction.deps !== null) {
				for (let i = 0; i < previous_skipped_deps; i += 1) {
					previous_reaction.deps[i].rv = read_version;
				}
			}
			if (previous_deps !== null) {
				for (const dep of previous_deps) {
					dep.rv = read_version;
				}
			}
			if (untracked_writes !== null) {
				if (previous_untracked_writes === null) {
					previous_untracked_writes = untracked_writes;
				} else {
					previous_untracked_writes.push(... (untracked_writes));
				}
			}
		}
		if ((reaction.f & ERROR_VALUE) !== 0) {
			reaction.f ^= ERROR_VALUE;
		}
		return result;
	} catch (error) {
		return handle_error(error);
	} finally {
		reaction.f ^= REACTION_IS_UPDATING;
		new_deps = previous_deps;
		skipped_deps = previous_skipped_deps;
		untracked_writes = previous_untracked_writes;
		active_reaction = previous_reaction;
		current_sources = previous_sources;
		set_component_context(previous_component_context);
		untracking = previous_untracking;
		update_version = previous_update_version;
	}
}
function remove_reaction(signal, dependency) {
	let reactions = dependency.reactions;
	if (reactions !== null) {
		var index = index_of.call(reactions, signal);
		if (index !== -1) {
			var new_length = reactions.length - 1;
			if (new_length === 0) {
				reactions = dependency.reactions = null;
			} else {
				reactions[index] = reactions[new_length];
				reactions.pop();
			}
		}
	}
	if (
		reactions === null &&
		(dependency.f & DERIVED) !== 0 &&
		(new_deps === null || !includes.call(new_deps, dependency))
	) {
		var derived =  (dependency);
		if ((derived.f & CONNECTED) !== 0) {
			derived.f ^= CONNECTED;
			derived.f &= ~WAS_MARKED;
		}
		if (derived.v !== UNINITIALIZED) {
			update_derived_status(derived);
		}
		if (derived.ac !== null) {
			without_reactive_context(() => {
				 (derived.ac).abort(STALE_REACTION);
				derived.ac = null;
				set_signal_status(derived, DIRTY);
			});
		}
		freeze_derived_effects(derived);
		remove_reactions(derived, 0);
	}
}
function remove_reactions(signal, start_index) {
	var dependencies = signal.deps;
	if (dependencies === null) return;
	for (var i = start_index; i < dependencies.length; i++) {
		remove_reaction(signal, dependencies[i]);
	}
}
function update_effect(effect) {
	var flags = effect.f;
	if ((flags & DESTROYED) !== 0) {
		return;
	}
	set_signal_status(effect, CLEAN);
	var previous_effect = active_effect;
	var was_updating_effect = is_updating_effect;
	active_effect = effect;
	is_updating_effect = (flags & (BRANCH_EFFECT | ROOT_EFFECT)) === 0;
	try {
		if ((flags & (BLOCK_EFFECT | MANAGED_EFFECT)) !== 0) {
			destroy_block_effect_children(effect);
		} else {
			destroy_effect_children(effect);
		}
		execute_effect_teardown(effect);
		var teardown = update_reaction(effect);
		effect.teardown = typeof teardown === 'function' ? teardown : null;
		effect.wv = write_version;
		var dep; if (DEV && tracing_mode_flag && (effect.f & DIRTY) !== 0 && effect.deps !== null) ;
	} finally {
		is_updating_effect = was_updating_effect;
		active_effect = previous_effect;
	}
}
async function tick() {
	await Promise.resolve();
	flushSync();
}
function get(signal) {
	var flags = signal.f;
	var is_derived = (flags & DERIVED) !== 0;
	if (active_reaction !== null && !untracking) {
		var destroyed = active_effect !== null && (active_effect.f & DESTROYED) !== 0;
		if (!destroyed && (current_sources === null || !current_sources.has(signal))) {
			var deps = active_reaction.deps;
			if ((active_reaction.f & REACTION_IS_UPDATING) !== 0) {
				if (signal.rv < read_version) {
					signal.rv = read_version;
					if (new_deps === null && deps !== null && deps[skipped_deps] === signal) {
						skipped_deps++;
					} else if (new_deps === null) {
						new_deps = [signal];
					} else {
						new_deps.push(signal);
					}
				}
			} else {
				active_reaction.deps ??= [];
				if (!includes.call(active_reaction.deps, signal)) {
					active_reaction.deps.push(signal);
				}
				var reactions = signal.reactions;
				if (reactions === null) {
					signal.reactions = [active_reaction];
				} else if (!includes.call(reactions, active_reaction)) {
					reactions.push(active_reaction);
				}
			}
		}
	}
	if (is_destroying_effect && old_values.has(signal)) {
		return old_values.get(signal);
	}
	if (is_derived) {
		var derived =  (signal);
		if (is_destroying_effect) {
			var value = derived.v;
			if (
				((derived.f & CLEAN) === 0 && derived.reactions !== null) ||
				depends_on_old_values(derived)
			) {
				value = execute_derived(derived);
			}
			old_values.set(derived, value);
			return value;
		}
		var should_connect =
			(derived.f & CONNECTED) === 0 &&
			!untracking &&
			active_reaction !== null &&
			(is_updating_effect || (active_reaction.f & CONNECTED) !== 0);
		var is_new = (derived.f & REACTION_RAN) === 0;
		if (is_dirty(derived)) {
			if (should_connect) {
				derived.f |= CONNECTED;
			}
			update_derived(derived);
		}
		if (should_connect && !is_new) {
			unfreeze_derived_effects(derived);
			reconnect(derived);
		}
	}
	if (batch_values?.has(signal)) {
		return batch_values.get(signal);
	}
	if ((signal.f & ERROR_VALUE) !== 0) {
		throw signal.v;
	}
	return signal.v;
}
function reconnect(derived) {
	derived.f |= CONNECTED;
	if (derived.deps === null) return;
	for (const dep of derived.deps) {
		(dep.reactions ??= []).push(derived);
		if ((dep.f & DERIVED) !== 0 && (dep.f & CONNECTED) === 0) {
			unfreeze_derived_effects( (dep));
			reconnect( (dep));
		}
	}
}
function depends_on_old_values(derived) {
	if (derived.v === UNINITIALIZED) return true;
	if (derived.deps === null) return false;
	for (const dep of derived.deps) {
		if (old_values.has(dep)) {
			return true;
		}
		if ((dep.f & DERIVED) !== 0 && depends_on_old_values( (dep))) {
			return true;
		}
	}
	return false;
}
function untrack(fn) {
	var previous_untracking = untracking;
	try {
		untracking = true;
		return fn();
	} finally {
		untracking = previous_untracking;
	}
}
function deep_read_state(value) {
	if (typeof value !== 'object' || !value || value instanceof EventTarget) {
		return;
	}
	if (STATE_SYMBOL in value) {
		deep_read(value);
	} else if (!Array.isArray(value)) {
		for (let key in value) {
			const prop = value[key];
			if (typeof prop === 'object' && prop && STATE_SYMBOL in prop) {
				deep_read(prop);
			}
		}
	}
}
function deep_read(value, visited = new Set()) {
	if (
		typeof value === 'object' &&
		value !== null &&
		!(value instanceof EventTarget) &&
		!visited.has(value)
	) {
		visited.add(value);
		if (value instanceof Date) {
			value.getTime();
		}
		for (let key in value) {
			try {
				deep_read(value[key], visited);
			} catch (e) {
			}
		}
		const proto = get_prototype_of(value);
		if (
			proto !== Object.prototype &&
			proto !== Array.prototype &&
			proto !== Map.prototype &&
			proto !== Set.prototype &&
			proto !== Date.prototype
		) {
			const descriptors = get_descriptors(proto);
			for (let key in descriptors) {
				const get = descriptors[key].get;
				if (get) {
					try {
						get.call(value);
					} catch (e) {
					}
				}
			}
		}
	}
}

export { active_effect, active_reaction, current_sources, deep_read, deep_read_state, get, increment_write_version, is_destroying_effect, is_dirty, new_deps, push_reaction_value, remove_reactions, set_active_effect, set_active_reaction, set_is_destroying_effect, set_untracked_writes, set_update_version, skipped_deps, tick, untrack, untracked_writes, untracking, update_effect, update_reaction, update_version, write_version };
