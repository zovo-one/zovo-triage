import { EACH_ITEM_REACTIVE, EACH_ITEM_IMMUTABLE, EACH_INDEX_REACTIVE, EACH_IS_CONTROLLED, EACH_IS_ANIMATED, HYDRATION_START_ELSE, HYDRATION_END } from './ztg-svelte-constants.js';
import { hydrating, set_hydrate_node, hydrate_next, read_hydration_instruction, skip_nodes, set_hydrating, hydrate_node } from './ztg-svelte-internal-client-dom-hydration.js';
import { create_text, should_defer_append, get_next_sibling, clear_text_content, get_first_child } from './ztg-svelte-internal-client-dom-operations.js';
import { block, branch, resume_effect, pause_effect, move_effect, destroy_effect } from './ztg-svelte-internal-client-reactivity-effects.js';
import { internal_set, mutable_source, source } from './ztg-svelte-internal-client-reactivity-sources.js';
import { is_array, array_from } from './ztg-svelte-internal-shared-utils.js';
import { EFFECT_OFFSCREEN, DESTROYED, INERT, BRANCH_EFFECT, COMMENT_NODE } from './ztg-svelte-internal-client-constants.js';
import { queue_micro_task } from './ztg-svelte-internal-client-dom-task.js';
import { get } from './ztg-svelte-internal-client-runtime.js';
import { derived_safe_equal } from './ztg-svelte-internal-client-reactivity-deriveds.js';
import { current_batch } from './ztg-svelte-internal-client-reactivity-batch.js';
import { each_key_duplicate } from './ztg-svelte-internal-client-errors.js';

function pause_effects(state, to_destroy, controlled_anchor) {
	var transitions = [];
	var length = to_destroy.length;
	var group;
	var remaining = to_destroy.length;
	for (var i = 0; i < length; i++) {
		let effect = to_destroy[i];
		pause_effect(
			effect,
			() => {
				if (group) {
					group.pending.delete(effect);
					group.done.add(effect);
					if (group.pending.size === 0) {
						var groups =  (state.outrogroups);
						destroy_effects(state, array_from(group.done));
						groups.delete(group);
						if (groups.size === 0) {
							state.outrogroups = null;
						}
					}
				} else {
					remaining -= 1;
				}
			},
			false
		);
	}
	if (remaining === 0) {
		var fast_path =
			transitions.length === 0 && controlled_anchor !== null && state.pending.size === 0;
		if (fast_path) {
			var anchor =  (controlled_anchor);
			var parent_node =  (anchor.parentNode);
			clear_text_content(parent_node);
			parent_node.append(anchor);
			state.items.clear();
		}
		destroy_effects(state, to_destroy, !fast_path);
	} else {
		group = {
			pending: new Set(to_destroy),
			done: new Set()
		};
		(state.outrogroups ??= new Set()).add(group);
	}
}
function destroy_effects(state, to_destroy, remove_dom = true) {
	var preserved_effects;
	if (state.pending.size > 0) {
		preserved_effects = new Set();
		for (const keys of state.pending.values()) {
			for (const key of keys) {
				preserved_effects.add( (state.items.get(key)).e);
			}
		}
	}
	for (var i = 0; i < to_destroy.length; i++) {
		var e = to_destroy[i];
		if (preserved_effects?.has(e)) {
			e.f |= EFFECT_OFFSCREEN;
			const fragment = document.createDocumentFragment();
			move_effect(e, fragment);
		} else {
			destroy_effect(to_destroy[i], remove_dom);
		}
	}
}
var offscreen_anchor;
function each(node, flags, get_collection, get_key, render_fn, fallback_fn = null) {
	var anchor = node;
	var items = new Map();
	var is_controlled = (flags & EACH_IS_CONTROLLED) !== 0;
	if (is_controlled) {
		var parent_node =  (node);
		anchor = hydrating
			? set_hydrate_node(get_first_child(parent_node))
			: parent_node.appendChild(create_text());
	}
	if (hydrating) {
		hydrate_next();
	}
	var fallback = null;
	var each_array = derived_safe_equal(() => {
		var collection = get_collection();
		return  (
			is_array(collection) ? collection : collection == null ? [] : array_from(collection)
		);
	});
	var array;
	var pending = new Map();
	var first_run = true;
	function commit(batch) {
		if ((state.effect.f & DESTROYED) !== 0) {
			return;
		}
		state.pending.delete(batch);
		state.fallback = fallback;
		reconcile(state, array, anchor, flags, get_key);
		if (fallback !== null) {
			if (array.length === 0) {
				if ((fallback.f & EFFECT_OFFSCREEN) === 0) {
					resume_effect(fallback);
				} else {
					fallback.f ^= EFFECT_OFFSCREEN;
					move(fallback, null, anchor);
				}
			} else {
				pause_effect(fallback, () => {
					fallback = null;
				});
			}
		}
	}
	function discard(batch) {
		state.pending.delete(batch);
	}
	var effect = block(() => {
		array =  (get(each_array));
		var length = array.length;
		let mismatch = false;
		if (hydrating) {
			var is_else = read_hydration_instruction(anchor) === HYDRATION_START_ELSE;
			if (is_else !== (length === 0)) {
				anchor = skip_nodes();
				set_hydrate_node(anchor);
				set_hydrating(false);
				mismatch = true;
			}
		}
		var keys = new Set();
		var batch =  (current_batch);
		var defer = should_defer_append();
		for (var index = 0; index < length; index += 1) {
			if (
				hydrating &&
				hydrate_node.nodeType === COMMENT_NODE &&
				 (hydrate_node).data === HYDRATION_END
			) {
				anchor =  (hydrate_node);
				mismatch = true;
				set_hydrating(false);
			}
			var value = array[index];
			var key = get_key(value, index);
			var item = first_run ? null : items.get(key);
			if (item) {
				if (item.v) internal_set(item.v, value);
				if (item.i) internal_set(item.i, index);
				if (defer) {
					batch.unskip_effect(item.e);
				}
			} else {
				item = create_item(
					items,
					first_run ? anchor : (offscreen_anchor ??= create_text()),
					value,
					key,
					index,
					render_fn,
					flags,
					get_collection
				);
				if (!first_run) {
					item.e.f |= EFFECT_OFFSCREEN;
				}
				items.set(key, item);
			}
			keys.add(key);
		}
		if (length === 0 && fallback_fn && !fallback) {
			if (first_run) {
				fallback = branch(() => fallback_fn(anchor));
			} else {
				fallback = branch(() => fallback_fn((offscreen_anchor ??= create_text())));
				fallback.f |= EFFECT_OFFSCREEN;
			}
		}
		if (length > keys.size) {
			{
				each_key_duplicate();
			}
		}
		if (hydrating && length > 0) {
			set_hydrate_node(skip_nodes());
		}
		if (!first_run) {
			pending.set(batch, keys);
			if (defer) {
				for (const [key, item] of items) {
					if (!keys.has(key)) {
						batch.skip_effect(item.e);
					}
				}
				batch.oncommit(commit);
				batch.ondiscard(discard);
			} else {
				commit(batch);
			}
		}
		if (mismatch) {
			set_hydrating(true);
		}
		get(each_array);
	});
	var state = { effect, items, pending, outrogroups: null, fallback };
	first_run = false;
	if (hydrating) {
		anchor = hydrate_node;
	}
}
function skip_to_branch(effect) {
	while (effect !== null && (effect.f & BRANCH_EFFECT) === 0) {
		effect = effect.next;
	}
	return effect;
}
function reconcile(state, array, anchor, flags, get_key) {
	var is_animated = (flags & EACH_IS_ANIMATED) !== 0;
	var length = array.length;
	var items = state.items;
	var current = skip_to_branch(state.effect.first);
	var seen;
	var prev = null;
	var to_animate;
	var matched = [];
	var stashed = [];
	var value;
	var key;
	var effect;
	var i;
	if (is_animated) {
		for (i = 0; i < length; i += 1) {
			value = array[i];
			key = get_key(value, i);
			effect =  (items.get(key)).e;
			if ((effect.f & EFFECT_OFFSCREEN) === 0) {
				effect.nodes?.a?.measure();
				(to_animate ??= new Set()).add(effect);
			}
		}
	}
	for (i = 0; i < length; i += 1) {
		value = array[i];
		key = get_key(value, i);
		effect =  (items.get(key)).e;
		if (state.outrogroups !== null) {
			for (const group of state.outrogroups) {
				group.pending.delete(effect);
				group.done.delete(effect);
			}
		}
		if ((effect.f & INERT) !== 0) {
			resume_effect(effect);
			if (is_animated) {
				effect.nodes?.a?.unfix();
				(to_animate ??= new Set()).delete(effect);
			}
		}
		if ((effect.f & EFFECT_OFFSCREEN) !== 0) {
			effect.f ^= EFFECT_OFFSCREEN;
			if (effect === current) {
				move(effect, null, anchor);
			} else {
				var next = prev ? prev.next : current;
				if (effect === state.effect.last) {
					state.effect.last = effect.prev;
				}
				if (effect.prev) effect.prev.next = effect.next;
				if (effect.next) effect.next.prev = effect.prev;
				link(state, prev, effect);
				link(state, effect, next);
				move(effect, next, anchor);
				prev = effect;
				matched = [];
				stashed = [];
				current = skip_to_branch(prev.next);
				continue;
			}
		}
		if (effect !== current) {
			if (seen !== undefined && seen.has(effect)) {
				if (matched.length < stashed.length) {
					var start = stashed[0];
					var j;
					prev = start.prev;
					var a = matched[0];
					var b = matched[matched.length - 1];
					for (j = 0; j < matched.length; j += 1) {
						move(matched[j], start, anchor);
					}
					for (j = 0; j < stashed.length; j += 1) {
						seen.delete(stashed[j]);
					}
					link(state, a.prev, b.next);
					link(state, prev, a);
					link(state, b, start);
					current = start;
					prev = b;
					i -= 1;
					matched = [];
					stashed = [];
				} else {
					seen.delete(effect);
					move(effect, current, anchor);
					link(state, effect.prev, effect.next);
					link(state, effect, prev === null ? state.effect.first : prev.next);
					link(state, prev, effect);
					prev = effect;
				}
				continue;
			}
			matched = [];
			stashed = [];
			while (current !== null && current !== effect) {
				(seen ??= new Set()).add(current);
				stashed.push(current);
				current = skip_to_branch(current.next);
			}
			if (current === null) {
				continue;
			}
		}
		if ((effect.f & EFFECT_OFFSCREEN) === 0) {
			matched.push(effect);
		}
		prev = effect;
		current = skip_to_branch(effect.next);
	}
	if (state.outrogroups !== null) {
		for (const group of state.outrogroups) {
			if (group.pending.size === 0) {
				destroy_effects(state, array_from(group.done));
				state.outrogroups?.delete(group);
			}
		}
		if (state.outrogroups.size === 0) {
			state.outrogroups = null;
		}
	}
	if (current !== null || seen !== undefined) {
		var to_destroy = [];
		if (seen !== undefined) {
			for (effect of seen) {
				if ((effect.f & INERT) === 0) {
					to_destroy.push(effect);
				}
			}
		}
		while (current !== null) {
			if ((current.f & INERT) === 0 && current !== state.fallback) {
				to_destroy.push(current);
			}
			current = skip_to_branch(current.next);
		}
		var destroy_length = to_destroy.length;
		if (destroy_length > 0) {
			var controlled_anchor = (flags & EACH_IS_CONTROLLED) !== 0 && length === 0 ? anchor : null;
			if (is_animated) {
				for (i = 0; i < destroy_length; i += 1) {
					to_destroy[i].nodes?.a?.measure();
				}
				for (i = 0; i < destroy_length; i += 1) {
					to_destroy[i].nodes?.a?.fix();
				}
			}
			pause_effects(state, to_destroy, controlled_anchor);
		}
	}
	if (is_animated) {
		queue_micro_task(() => {
			if (to_animate === undefined) return;
			for (effect of to_animate) {
				effect.nodes?.a?.apply();
			}
		});
	}
}
function create_item(items, anchor, value, key, index, render_fn, flags, get_collection) {
	var v =
		(flags & EACH_ITEM_REACTIVE) !== 0
			? (flags & EACH_ITEM_IMMUTABLE) === 0
				? mutable_source(value, false, false)
				: source(value)
			: null;
	var i = (flags & EACH_INDEX_REACTIVE) !== 0 ? source(index) : null;
	return {
		v,
		i,
		e: branch(() => {
			render_fn(anchor, v ?? value, i ?? index, get_collection);
			return () => {
				items.delete(key);
			};
		})
	};
}
function move(effect, next, anchor) {
	if (!effect.nodes) return;
	var node = effect.nodes.start;
	var end = effect.nodes.end;
	var dest =
		next && (next.f & EFFECT_OFFSCREEN) === 0
			?  (next.nodes).start
			: anchor;
	while (node !== null) {
		var next_node =  (get_next_sibling(node));
		dest.before(node);
		if (node === end) {
			return;
		}
		node = next_node;
	}
}
function link(state, prev, next) {
	if (prev === null) {
		state.effect.first = next;
	} else {
		prev.next = next;
	}
	if (next === null) {
		state.effect.last = prev;
	} else {
		next.prev = prev;
	}
}

export { each };
