import { CONNECTED, CLEAN, MAYBE_DIRTY } from './ztg-svelte-internal-client-constants.js';

const STATUS_MASK = -7169;
function set_signal_status(signal, status) {
	signal.f = (signal.f & STATUS_MASK) | status;
}
function update_derived_status(derived) {
	if ((derived.f & CONNECTED) !== 0 || derived.deps === null) {
		set_signal_status(derived, CLEAN);
	} else {
		set_signal_status(derived, MAYBE_DIRTY);
	}
}

export { set_signal_status, update_derived_status };
