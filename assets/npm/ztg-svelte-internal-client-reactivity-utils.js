import { DIRTY, MAYBE_DIRTY, CLEAN, DERIVED, WAS_MARKED } from './ztg-svelte-internal-client-constants.js';
import { set_signal_status } from './ztg-svelte-internal-client-reactivity-status.js';

function clear_marked(deps) {
	if (deps === null) return;
	for (const dep of deps) {
		if ((dep.f & DERIVED) === 0 || (dep.f & WAS_MARKED) === 0) {
			continue;
		}
		dep.f ^= WAS_MARKED;
		clear_marked( (dep).deps);
	}
}
function defer_effect(effect, dirty_effects, maybe_dirty_effects) {
	if ((effect.f & DIRTY) !== 0) {
		dirty_effects.add(effect);
	} else if ((effect.f & MAYBE_DIRTY) !== 0) {
		maybe_dirty_effects.add(effect);
	}
	clear_marked(effect.deps);
	set_signal_status(effect, CLEAN);
}

export { defer_effect };
