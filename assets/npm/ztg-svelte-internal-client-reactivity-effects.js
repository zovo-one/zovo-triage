import { active_effect, update_effect, remove_reactions, set_is_destroying_effect, set_active_reaction, active_reaction, untracking, is_destroying_effect, get } from './ztg-svelte-internal-client-runtime.js';
import { INERT, EFFECT, EFFECT_PRESERVED, BLOCK_EFFECT, EFFECT_TRANSPARENT, RENDER_EFFECT, DIRTY, CONNECTED, HEAD_EFFECT, DESTROYING, DESTROYED, BRANCH_EFFECT, STALE_REACTION, ROOT_EFFECT, ASYNC, USER_EFFECT, CLEAN, DERIVED } from './ztg-svelte-internal-client-constants.js';
import { effect_orphan, effect_in_unowned_derived, effect_in_teardown } from './ztg-svelte-internal-client-errors.js';
import { get_next_sibling } from './ztg-svelte-internal-client-dom-operations.js';
import { component_context } from './ztg-svelte-internal-client-context.js';
import { current_batch, Batch, collected_effects } from './ztg-svelte-internal-client-reactivity-batch.js';
import { flatten } from './ztg-svelte-internal-client-reactivity-async.js';
import { without_reactive_context } from './ztg-svelte-internal-client-dom-elements-bindings-shared.js';
import { set_signal_status } from './ztg-svelte-internal-client-reactivity-status.js';

function validate_effect(rune) {
	if (active_effect === null) {
		if (active_reaction === null) {
			effect_orphan();
		}
		effect_in_unowned_derived();
	}
	if (is_destroying_effect) {
		effect_in_teardown();
	}
}
function push_effect(effect, parent_effect) {
	var parent_last = parent_effect.last;
	if (parent_last === null) {
		parent_effect.last = parent_effect.first = effect;
	} else {
		parent_last.next = effect;
		effect.prev = parent_last;
		parent_effect.last = effect;
	}
}
function create_effect(type, fn) {
	var parent = active_effect;
	if (parent !== null && (parent.f & INERT) !== 0) {
		type |= INERT;
	}
	var effect = {
		ctx: component_context,
		deps: null,
		nodes: null,
		f: type | DIRTY | CONNECTED,
		first: null,
		fn,
		last: null,
		next: null,
		parent,
		b: parent && parent.b,
		prev: null,
		teardown: null,
		wv: 0,
		ac: null
	};
	current_batch?.register_created_effect(effect);
	var e = effect;
	if ((type & EFFECT) !== 0) {
		if (collected_effects !== null) {
			collected_effects.push(effect);
		} else {
			Batch.ensure().schedule(effect);
		}
	} else if (fn !== null) {
		try {
			update_effect(effect);
		} catch (e) {
			destroy_effect(effect);
			throw e;
		}
		if (
			e.deps === null &&
			e.teardown === null &&
			e.nodes === null &&
			e.first === e.last &&
			(e.f & EFFECT_PRESERVED) === 0
		) {
			e = e.first;
			if ((type & BLOCK_EFFECT) !== 0 && (type & EFFECT_TRANSPARENT) !== 0 && e !== null) {
				e.f |= EFFECT_TRANSPARENT;
			}
		}
	}
	if (e !== null) {
		e.parent = parent;
		if (parent !== null) {
			push_effect(e, parent);
		}
		if (
			active_reaction !== null &&
			(active_reaction.f & DERIVED) !== 0 &&
			(type & ROOT_EFFECT) === 0
		) {
			var derived =  (active_reaction);
			(derived.effects ??= []).push(e);
		}
	}
	return effect;
}
function effect_tracking() {
	return active_reaction !== null && !untracking;
}
function teardown(fn) {
	const effect = create_effect(RENDER_EFFECT, null);
	set_signal_status(effect, CLEAN);
	effect.teardown = fn;
	return effect;
}
function user_effect(fn) {
	validate_effect();
	var flags =  (active_effect).f;
	var defer =
		!active_reaction &&
		(flags & BRANCH_EFFECT) !== 0 &&
		component_context !== null &&
		!component_context.i;
	if (defer) {
		var context =  (component_context);
		(context.e ??= []).push(fn);
	} else {
		return create_user_effect(fn);
	}
}
function create_user_effect(fn) {
	return create_effect(EFFECT | USER_EFFECT, fn);
}
function user_pre_effect(fn) {
	validate_effect();
	return create_effect(RENDER_EFFECT | USER_EFFECT, fn);
}
function effect_root(fn) {
	Batch.ensure();
	const effect = create_effect(ROOT_EFFECT | EFFECT_PRESERVED, fn);
	return () => {
		destroy_effect(effect);
	};
}
function component_root(fn) {
	Batch.ensure();
	const effect = create_effect(ROOT_EFFECT | EFFECT_PRESERVED, fn);
	return (options = {}) => {
		return new Promise((fulfil) => {
			if (options.outro) {
				pause_effect(effect, () => {
					destroy_effect(effect);
					fulfil(undefined);
				});
			} else {
				destroy_effect(effect);
				fulfil(undefined);
			}
		});
	};
}
function effect(fn) {
	return create_effect(EFFECT, fn);
}
function async_effect(fn) {
	return create_effect(ASYNC | EFFECT_PRESERVED, fn);
}
function render_effect(fn, flags = 0) {
	return create_effect(RENDER_EFFECT | flags, fn);
}
function template_effect(fn, sync = [], async = [], blockers = []) {
	flatten(blockers, sync, async, (values) => {
		create_effect(RENDER_EFFECT, () => {
			fn(...values.map(get));
		});
	});
}
function block(fn, flags = 0) {
	var effect = create_effect(BLOCK_EFFECT | flags, fn);
	return effect;
}
function branch(fn) {
	return create_effect(BRANCH_EFFECT | EFFECT_PRESERVED, fn);
}
function execute_effect_teardown(effect) {
	var teardown = effect.teardown;
	if (teardown !== null) {
		const previously_destroying_effect = is_destroying_effect;
		const previous_reaction = active_reaction;
		set_is_destroying_effect(true);
		set_active_reaction(null);
		try {
			teardown.call(null);
		} finally {
			set_is_destroying_effect(previously_destroying_effect);
			set_active_reaction(previous_reaction);
		}
	}
}
function destroy_effect_children(signal, remove_dom = false) {
	var effect = signal.first;
	signal.first = signal.last = null;
	while (effect !== null) {
		const controller = effect.ac;
		if (controller !== null) {
			without_reactive_context(() => {
				controller.abort(STALE_REACTION);
			});
		}
		var next = effect.next;
		if ((effect.f & ROOT_EFFECT) !== 0) {
			effect.parent = null;
		} else {
			destroy_effect(effect, remove_dom);
		}
		effect = next;
	}
}
function destroy_block_effect_children(signal) {
	var effect = signal.first;
	while (effect !== null) {
		var next = effect.next;
		if ((effect.f & BRANCH_EFFECT) === 0) {
			destroy_effect(effect);
		}
		effect = next;
	}
}
function destroy_effect(effect, remove_dom = true) {
	var removed = false;
	if (
		(remove_dom || (effect.f & HEAD_EFFECT) !== 0) &&
		effect.nodes !== null &&
		effect.nodes.end !== null
	) {
		remove_effect_dom(effect.nodes.start,  (effect.nodes.end));
		removed = true;
	}
	effect.f |= DESTROYING;
	destroy_effect_children(effect, remove_dom && !removed);
	remove_reactions(effect, 0);
	var transitions = effect.nodes && effect.nodes.t;
	if (transitions !== null) {
		for (const transition of transitions) {
			transition.stop();
		}
	}
	execute_effect_teardown(effect);
	effect.f ^= DESTROYING;
	effect.f |= DESTROYED;
	var parent = effect.parent;
	if (parent !== null && parent.first !== null) {
		unlink_effect(effect);
	}
	effect.next =
		effect.prev =
		effect.teardown =
		effect.ctx =
		effect.deps =
		effect.fn =
		effect.nodes =
		effect.ac =
		effect.b =
			null;
}
function remove_effect_dom(node, end) {
	while (node !== null) {
		var next = node === end ? null : get_next_sibling(node);
		node.remove();
		node = next;
	}
}
function unlink_effect(effect) {
	var parent = effect.parent;
	var prev = effect.prev;
	var next = effect.next;
	if (prev !== null) prev.next = next;
	if (next !== null) next.prev = prev;
	if (parent !== null) {
		if (parent.first === effect) parent.first = next;
		if (parent.last === effect) parent.last = prev;
	}
}
function pause_effect(effect, callback, destroy = true) {
	var transitions = [];
	pause_children(effect, transitions, true);
	var fn = () => {
		if (destroy) destroy_effect(effect);
		if (callback) callback();
	};
	var remaining = transitions.length;
	if (remaining > 0) {
		var check = () => --remaining || fn();
		for (var transition of transitions) {
			transition.out(check);
		}
	} else {
		fn();
	}
}
function pause_children(effect, transitions, local) {
	if ((effect.f & INERT) !== 0) return;
	effect.f ^= INERT;
	var t = effect.nodes && effect.nodes.t;
	if (t !== null) {
		for (const transition of t) {
			if (transition.is_global || local) {
				transitions.push(transition);
			}
		}
	}
	var child = effect.first;
	while (child !== null) {
		var sibling = child.next;
		if ((child.f & ROOT_EFFECT) === 0) {
			var transparent =
				(child.f & EFFECT_TRANSPARENT) !== 0 ||
				((child.f & BRANCH_EFFECT) !== 0 && (effect.f & BLOCK_EFFECT) !== 0);
			pause_children(child, transitions, transparent ? local : false);
		}
		child = sibling;
	}
}
function resume_effect(effect) {
	resume_children(effect, true);
}
function resume_children(effect, local) {
	if ((effect.f & INERT) === 0) return;
	effect.f ^= INERT;
	if ((effect.f & CLEAN) === 0) {
		set_signal_status(effect, DIRTY);
		Batch.ensure().schedule(effect);
	}
	var child = effect.first;
	while (child !== null) {
		var sibling = child.next;
		var transparent = (child.f & EFFECT_TRANSPARENT) !== 0 || (child.f & BRANCH_EFFECT) !== 0;
		resume_children(child, transparent ? local : false);
		child = sibling;
	}
	var t = effect.nodes && effect.nodes.t;
	if (t !== null) {
		for (const transition of t) {
			if (transition.is_global || local) {
				transition.in();
			}
		}
	}
}
function move_effect(effect, fragment) {
	if (!effect.nodes) return;
	var node = effect.nodes.start;
	var end = effect.nodes.end;
	while (node !== null) {
		var next = node === end ? null : get_next_sibling(node);
		fragment.append(node);
		node = next;
	}
}

export { async_effect, block, branch, component_root, create_user_effect, destroy_block_effect_children, destroy_effect, destroy_effect_children, effect, effect_root, effect_tracking, execute_effect_teardown, move_effect, pause_effect, remove_effect_dom, render_effect, resume_effect, teardown, template_effect, unlink_effect, user_effect, user_pre_effect, validate_effect };
