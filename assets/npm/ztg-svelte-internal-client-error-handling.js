import { DESTROYED, BOUNDARY_EFFECT, REACTION_RAN, ERROR_VALUE, EFFECT } from './ztg-svelte-internal-client-constants.js';
import { active_reaction, active_effect } from './ztg-svelte-internal-client-runtime.js';

function handle_error(error) {
	var effect = active_effect;
	if (effect === null) {
		 (active_reaction).f |= ERROR_VALUE;
		return error;
	}
	if ((effect.f & REACTION_RAN) === 0 && (effect.f & EFFECT) === 0) {
		throw error;
	}
	invoke_error_boundary(error, effect);
}
function invoke_error_boundary(error, effect) {
	if (effect !== null && (effect.f & DESTROYED) !== 0) {
		return;
	}
	while (effect !== null) {
		if ((effect.f & BOUNDARY_EFFECT) !== 0) {
			if ((effect.f & REACTION_RAN) === 0) {
				throw error;
			}
			try {
				 (effect.b).error(error);
				return;
			} catch (e) {
				error = e;
			}
		}
		effect = effect.parent;
	}
	throw error;
}

export { handle_error, invoke_error_boundary };
