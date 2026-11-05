import { teardown } from './ztg-svelte-internal-client-reactivity-effects.js';
import { define_property } from './ztg-svelte-internal-shared-utils.js';
import './ztg-svelte-internal-client-constants.js';
import { set_active_reaction, set_active_effect, active_reaction, active_effect } from './ztg-svelte-internal-client-runtime.js';
import { queue_micro_task } from './ztg-svelte-internal-client-dom-task.js';
import { without_reactive_context } from './ztg-svelte-internal-client-dom-elements-bindings-shared.js';

const event_symbol = Symbol('events');
const all_registered_events = new Set();
const root_event_handles = new Set();
function create_event(event_name, dom, handler, options = {}) {
	function target_handler( event) {
		if (!options.capture) {
			handle_event_propagation.call(dom, event);
		}
		if (!event.cancelBubble) {
			return without_reactive_context(() => {
				return handler?.call(this, event);
			});
		}
	}
	if (
		event_name.startsWith('pointer') ||
		event_name.startsWith('touch') ||
		event_name === 'wheel'
	) {
		queue_micro_task(() => {
			dom.addEventListener(event_name, target_handler, options);
		});
	} else {
		dom.addEventListener(event_name, target_handler, options);
	}
	return target_handler;
}
function event(event_name, dom, handler, capture, passive) {
	var options = { capture, passive };
	var target_handler = create_event(event_name, dom, handler, options);
	if (
		dom === document.body ||
		dom === window ||
		dom === document ||
		dom instanceof HTMLMediaElement
	) {
		teardown(() => {
			dom.removeEventListener(event_name, target_handler, options);
		});
	}
}
function delegated(event_name, element, handler) {
	(element[event_symbol] ??= {})[event_name] = handler;
}
function delegate(events) {
	for (var i = 0; i < events.length; i++) {
		all_registered_events.add(events[i]);
	}
	for (var fn of root_event_handles) {
		fn(events);
	}
}
let last_propagated_event = null;
function handle_event_propagation(event) {
	var handler_element = this;
	var owner_document =  (handler_element).ownerDocument;
	var event_name = event.type;
	var path = event.composedPath?.() || [];
	var current_target =  (path[0] || event.target);
	last_propagated_event = event;
	var path_idx = 0;
	var handled_at = last_propagated_event === event && event[event_symbol];
	if (handled_at) {
		var at_idx = path.indexOf(handled_at);
		if (
			at_idx !== -1 &&
			(handler_element === document || handler_element ===  (window))
		) {
			event[event_symbol] = handler_element;
			return;
		}
		var handler_idx = path.indexOf(handler_element);
		if (handler_idx === -1) {
			return;
		}
		if (at_idx <= handler_idx) {
			path_idx = at_idx;
		}
	}
	current_target =  (path[path_idx] || event.target);
	if (current_target === handler_element) return;
	define_property(event, 'currentTarget', {
		configurable: true,
		get() {
			return current_target || owner_document;
		}
	});
	var previous_reaction = active_reaction;
	var previous_effect = active_effect;
	set_active_reaction(null);
	set_active_effect(null);
	try {
		var throw_error;
		var other_errors = [];
		while (current_target !== null) {
			if (current_target === handler_element) break;
			try {
				var delegated = current_target[event_symbol]?.[event_name];
				if (
					delegated != null &&
					(!( (current_target).disabled) ||
						event.target === current_target)
				) {
					delegated.call(current_target, event);
				}
			} catch (error) {
				if (throw_error) {
					other_errors.push(error);
				} else {
					throw_error = error;
				}
			}
			if (event.cancelBubble) break;
			path_idx++;
			current_target = path_idx < path.length ?  (path[path_idx]) : null;
		}
		if (throw_error) {
			for (let error of other_errors) {
				queueMicrotask(() => {
					throw error;
				});
			}
			throw throw_error;
		}
	} finally {
		event[event_symbol] = handler_element;
		delete event.currentTarget;
		set_active_reaction(previous_reaction);
		set_active_effect(previous_effect);
	}
}

export { all_registered_events, create_event, delegate, delegated, event, event_symbol, handle_event_propagation, root_event_handles };
