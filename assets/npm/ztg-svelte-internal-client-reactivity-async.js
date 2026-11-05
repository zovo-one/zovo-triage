import { DESTROYED } from './ztg-svelte-internal-client-constants.js';
import { set_component_context, component_context, is_runes } from './ztg-svelte-internal-client-context.js';
import { invoke_error_boundary } from './ztg-svelte-internal-client-error-handling.js';
import { active_effect, set_active_effect, set_active_reaction, active_reaction } from './ztg-svelte-internal-client-runtime.js';
import { current_batch } from './ztg-svelte-internal-client-reactivity-batch.js';
import { derived, async_derived, derived_safe_equal } from './ztg-svelte-internal-client-reactivity-deriveds.js';

function flatten(blockers, sync, async, fn) {
	const d = is_runes() ? derived : derived_safe_equal;
	var pending = blockers.filter((b) => !b.settled);
	var deriveds = sync.map(d);
	if (async.length === 0 && pending.length === 0) {
		fn(deriveds);
		return;
	}
	var parent =  (active_effect);
	var restore = capture();
	var blocker_promise =
		pending.length === 1
			? pending[0].promise
			: pending.length > 1
				? Promise.all(pending.map((b) => b.promise))
				: null;
	function finish(async) {
		if ((parent.f & DESTROYED) !== 0) {
			return;
		}
		restore();
		try {
			fn([...deriveds, ...async]);
		} catch (error) {
			invoke_error_boundary(error, parent);
		}
		unset_context();
	}
	var decrement_pending = increment_pending();
	if (async.length === 0) {
		 (blocker_promise).then(() => finish([])).finally(decrement_pending);
		return;
	}
	function run() {
		Promise.all(async.map((expression) => async_derived(expression)))
			.then(finish)
			.catch((error) => invoke_error_boundary(error, parent))
			.finally(decrement_pending);
	}
	if (blocker_promise) {
		blocker_promise.then(() => {
			restore();
			run();
			unset_context();
		});
	} else {
		run();
	}
}
function capture() {
	var previous_effect =  (active_effect);
	var previous_reaction = active_reaction;
	var previous_component_context = component_context;
	var previous_batch =  (current_batch);
	return function restore(activate_batch = true) {
		set_active_effect(previous_effect);
		set_active_reaction(previous_reaction);
		set_component_context(previous_component_context);
		if (activate_batch && (previous_effect.f & DESTROYED) === 0) {
			previous_batch?.activate();
			previous_batch?.apply();
		}
	};
}
function unset_context(deactivate_batch = true) {
	set_active_effect(null);
	set_active_reaction(null);
	set_component_context(null);
	if (deactivate_batch) current_batch?.deactivate();
}
function increment_pending() {
	var effect =  (active_effect);
	var boundary = effect.b;
	var batch =  (current_batch);
	var blocking = !!boundary?.is_rendered();
	boundary?.update_pending_count(1, batch);
	batch.increment(blocking, effect);
	return () => {
		boundary?.update_pending_count(-1, batch);
		batch.decrement(blocking, effect);
	};
}

export { capture, flatten, increment_pending, unset_context };
