import { increment_write_version, active_effect, is_dirty, update_effect, push_reaction_value, active_reaction, untracking, current_sources, is_destroying_effect, untracked_writes, set_untracked_writes } from './ztg-svelte-internal-client-runtime.js';
import { equals, safe_equals } from './ztg-svelte-internal-client-reactivity-equality.js';
import { DERIVED, DIRTY, CLEAN, BRANCH_EFFECT, ROOT_EFFECT, EAGER_EFFECT, WAS_MARKED, CONNECTED, REACTION_IS_UPDATING, MAYBE_DIRTY, BLOCK_EFFECT, ASYNC } from './ztg-svelte-internal-client-constants.js';
import { state_unsafe_mutation } from './ztg-svelte-internal-client-errors.js';
import { legacy_mode_flag } from './ztg-svelte-internal-flags.js';
import { proxy } from './ztg-svelte-internal-client-proxy.js';
import { Batch, batch_values, schedule_effect, legacy_updates, eager_block_effects } from './ztg-svelte-internal-client-reactivity-batch.js';
import { component_context, is_runes } from './ztg-svelte-internal-client-context.js';
import { execute_derived } from './ztg-svelte-internal-client-reactivity-deriveds.js';
import { update_derived_status, set_signal_status } from './ztg-svelte-internal-client-reactivity-status.js';

let eager_effects = new Set();
const old_values = new Map();
let eager_effects_deferred = false;
function source(v, stack) {
	var signal = {
		f: 0,
		v,
		reactions: null,
		equals,
		rv: 0,
		wv: 0
	};
	return signal;
}
function state(v, stack) {
	const s = source(v);
	push_reaction_value(s);
	return s;
}
function mutable_source(initial_value, immutable = false, trackable = true) {
	const s = source(initial_value);
	if (!immutable) {
		s.equals = safe_equals;
	}
	if (legacy_mode_flag && trackable && component_context !== null && component_context.l !== null) {
		(component_context.l.s ??= []).push(s);
	}
	return s;
}
function set(source, value, should_proxy = false) {
	if (
		active_reaction !== null &&
		(!untracking || (active_reaction.f & EAGER_EFFECT) !== 0) &&
		is_runes() &&
		(active_reaction.f & (DERIVED | BLOCK_EFFECT | ASYNC | EAGER_EFFECT)) !== 0 &&
		(current_sources === null || !current_sources.has(source))
	) {
		state_unsafe_mutation();
	}
	let new_value = should_proxy ? proxy(value) : value;
	return internal_set(source, new_value, legacy_updates);
}
function internal_set(source, value, updated_during_traversal = null) {
	if (!source.equals(value)) {
		old_values.set(source, is_destroying_effect ? value : source.v);
		var batch = Batch.ensure();
		batch.capture(source, value);
		if ((source.f & DERIVED) !== 0) {
			const derived =  (source);
			if ((source.f & DIRTY) !== 0) {
				execute_derived(derived);
			}
			if (batch_values === null) {
				update_derived_status(derived);
			}
		}
		source.wv = increment_write_version();
		mark_reactions(source, DIRTY, updated_during_traversal);
		if (
			is_runes() &&
			active_effect !== null &&
			(active_effect.f & CLEAN) !== 0 &&
			(active_effect.f & (BRANCH_EFFECT | ROOT_EFFECT)) === 0
		) {
			if (untracked_writes === null) {
				set_untracked_writes([source]);
			} else {
				untracked_writes.push(source);
			}
		}
		if (!batch.is_fork && eager_effects.size > 0 && !eager_effects_deferred) {
			flush_eager_effects();
		}
	}
	return value;
}
function flush_eager_effects() {
	eager_effects_deferred = false;
	for (const effect of eager_effects) {
		if ((effect.f & CLEAN) !== 0) {
			set_signal_status(effect, MAYBE_DIRTY);
		}
		let dirty;
		try {
			dirty = is_dirty(effect);
		} catch {
			dirty = true;
		}
		if (dirty) {
			update_effect(effect);
		}
	}
	eager_effects.clear();
}
function increment(source) {
	set(source, source.v + 1);
}
function mark_reactions(signal, status, updated_during_traversal) {
	var reactions = signal.reactions;
	if (reactions === null) return;
	var runes = is_runes();
	var length = reactions.length;
	for (var i = 0; i < length; i++) {
		var reaction = reactions[i];
		var flags = reaction.f;
		if (!runes && reaction === active_effect) continue;
		var not_dirty = (flags & DIRTY) === 0;
		if (not_dirty) {
			set_signal_status(reaction, status);
		}
		if ((flags & EAGER_EFFECT) !== 0) {
			eager_effects.add( (reaction));
		} else if ((flags & DERIVED) !== 0) {
			var derived =  (reaction);
			batch_values?.delete(derived);
			if ((flags & WAS_MARKED) === 0) {
				if (
					flags & CONNECTED &&
					(active_effect === null || (active_effect.f & REACTION_IS_UPDATING) === 0)
				) {
					reaction.f |= WAS_MARKED;
				}
				mark_reactions(derived, MAYBE_DIRTY, updated_during_traversal);
			}
		} else if (not_dirty) {
			var effect =  (reaction);
			if ((flags & BLOCK_EFFECT) !== 0 && eager_block_effects !== null) {
				eager_block_effects.add(effect);
			}
			if (updated_during_traversal !== null) {
				updated_during_traversal.push(effect);
			} else {
				schedule_effect(effect);
			}
		}
	}
}

export { eager_effects, flush_eager_effects, increment, internal_set, mutable_source, old_values, set, source, state };
