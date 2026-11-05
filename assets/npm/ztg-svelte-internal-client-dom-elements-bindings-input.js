import { render_effect } from './ztg-svelte-internal-client-reactivity-effects.js';
import { listen_to_event_and_reset_event } from './ztg-svelte-internal-client-dom-elements-bindings-shared.js';
import { tick, untrack } from './ztg-svelte-internal-client-runtime.js';
import './ztg-svelte-internal-client-constants.js';
import { current_batch } from './ztg-svelte-internal-client-reactivity-batch.js';
import { hydrating } from './ztg-svelte-internal-client-dom-hydration.js';

function bind_value(input, get, set = get) {
	var batches = new WeakSet();
	listen_to_event_and_reset_event(input, 'input', async (is_reset) => {
		var value = is_reset ? input.defaultValue : input.value;
		value = is_numberlike_input(input) ? to_number(value) : value;
		set(value);
		if (current_batch !== null) {
			batches.add(current_batch);
		}
		await tick();
		if (value !== (value = get())) {
			var start = input.selectionStart;
			var end = input.selectionEnd;
			var length = input.value.length;
			input.value = value ?? '';
			if (end !== null) {
				var new_length = input.value.length;
				if (start === end && end === length && new_length > length) {
					input.selectionStart = new_length;
					input.selectionEnd = new_length;
				} else {
					input.selectionStart = start;
					input.selectionEnd = Math.min(end, new_length);
				}
			}
		}
	});
	if (
		(hydrating && input.defaultValue !== input.value) ||
		(untrack(get) == null && input.value)
	) {
		set(is_numberlike_input(input) ? to_number(input.value) : input.value);
		if (current_batch !== null) {
			batches.add(current_batch);
		}
	}
	render_effect(() => {
		var value = get();
		if (input === document.activeElement) {
			var batch =  (current_batch);
			if (batches.has(batch)) {
				return;
			}
		}
		if (is_numberlike_input(input) && value === to_number(input.value)) {
			return;
		}
		if (input.type === 'date' && !value && !input.value) {
			return;
		}
		if (value !== input.value) {
			input.value = value ?? '';
		}
	});
}
function is_numberlike_input(input) {
	var type = input.type;
	return type === 'number' || type === 'range';
}
function to_number(value) {
	return value === '' ? null : +value;
}

export { bind_value };
