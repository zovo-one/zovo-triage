import { init_operations, create_text, get_first_child, get_next_sibling, clear_text_content } from './ztg-svelte-internal-client-dom-operations.js';
import { HYDRATION_START, HYDRATION_ERROR, HYDRATION_END } from './ztg-svelte-constants.js';
import { active_effect } from './ztg-svelte-internal-client-runtime.js';
import { push, component_context, pop } from './ztg-svelte-internal-client-context.js';
import { component_root } from './ztg-svelte-internal-client-reactivity-effects.js';
import { set_hydrating, set_hydrate_node, hydrating, hydrate_node } from './ztg-svelte-internal-client-dom-hydration.js';
import { array_from } from './ztg-svelte-internal-shared-utils.js';
import { all_registered_events, root_event_handles, handle_event_propagation } from './ztg-svelte-internal-client-dom-elements-events.js';
import { hydration_mismatch } from './ztg-svelte-internal-client-warnings.js';
import { hydration_failed } from './ztg-svelte-internal-client-errors.js';
import { assign_nodes } from './ztg-svelte-internal-client-dom-template.js';
import { is_passive_event } from './ztg-svelte-utils.js';
import { TEXT_CACHE, COMMENT_NODE } from './ztg-svelte-internal-client-constants.js';
import { boundary } from './ztg-svelte-internal-client-dom-blocks-boundary.js';

function set_text(text, value) {
	var str = value == null ? '' : typeof value === 'object' ? `${value}` : value;
	if (str !== ( (text)[TEXT_CACHE] ??= text.nodeValue)) {
		 (text)[TEXT_CACHE] = str;
		text.nodeValue = `${str}`;
	}
}
function mount(component, options) {
	return _mount(component, options);
}
function hydrate(component, options) {
	init_operations();
	options.intro = options.intro ?? false;
	const target = options.target;
	const was_hydrating = hydrating;
	const previous_hydrate_node = hydrate_node;
	try {
		var anchor = get_first_child(target);
		while (
			anchor &&
			(anchor.nodeType !== COMMENT_NODE ||  (anchor).data !== HYDRATION_START)
		) {
			anchor = get_next_sibling(anchor);
		}
		if (!anchor) {
			throw HYDRATION_ERROR;
		}
		set_hydrating(true);
		set_hydrate_node( (anchor));
		const instance = _mount(component, { ...options, anchor });
		set_hydrating(false);
		return  (instance);
	} catch (error) {
		if (
			error instanceof Error &&
			error.message.split('\n').some((line) => line.startsWith('https://svelte.dev/e/'))
		) {
			throw error;
		}
		if (error !== HYDRATION_ERROR) {
			console.warn('Failed to hydrate: ', error);
		}
		if (options.recover === false) {
			hydration_failed();
		}
		init_operations();
		clear_text_content(target);
		set_hydrating(false);
		return mount(component, options);
	} finally {
		set_hydrating(was_hydrating);
		set_hydrate_node(previous_hydrate_node);
	}
}
const listeners = new Map();
function _mount(
	Component,
	{ target, anchor, props = {}, events, context, intro = true, transformError }
) {
	init_operations();
	var component = undefined;
	var unmount = component_root(() => {
		var anchor_node = anchor ?? target.appendChild(create_text());
		boundary(
			 (anchor_node),
			{
				pending: () => {}
			},
			(anchor_node) => {
				push({});
				var ctx =  (component_context);
				if (context) ctx.c = context;
				if (events) {
					 (props).$$events = events;
				}
				if (hydrating) {
					assign_nodes( (anchor_node), null);
				}
				component = Component(anchor_node, props) || {};
				if (hydrating) {
					 (active_effect).nodes.end = hydrate_node;
					if (
						hydrate_node === null ||
						hydrate_node.nodeType !== COMMENT_NODE ||
						 (hydrate_node).data !== HYDRATION_END
					) {
						hydration_mismatch();
						throw HYDRATION_ERROR;
					}
				}
				pop();
			},
			transformError
		);
		var registered_events = new Set();
		var event_handle = (events) => {
			for (var i = 0; i < events.length; i++) {
				var event_name = events[i];
				if (registered_events.has(event_name)) continue;
				registered_events.add(event_name);
				var passive = is_passive_event(event_name);
				for (const node of [target, document]) {
					var counts = listeners.get(node);
					if (counts === undefined) {
						counts = new Map();
						listeners.set(node, counts);
					}
					var count = counts.get(event_name);
					if (count === undefined) {
						node.addEventListener(event_name, handle_event_propagation, { passive });
						counts.set(event_name, 1);
					} else {
						counts.set(event_name, count + 1);
					}
				}
			}
		};
		event_handle(array_from(all_registered_events));
		root_event_handles.add(event_handle);
		return () => {
			for (var event_name of registered_events) {
				for (const node of [target, document]) {
					var counts =  (listeners.get(node));
					var count =  (counts.get(event_name));
					if (--count == 0) {
						node.removeEventListener(event_name, handle_event_propagation);
						counts.delete(event_name);
						if (counts.size === 0) {
							listeners.delete(node);
						}
					} else {
						counts.set(event_name, count);
					}
				}
			}
			root_event_handles.delete(event_handle);
			if (anchor_node !== anchor) {
				anchor_node.parentNode?.removeChild(anchor_node);
			}
		};
	});
	mounted_components.set(component, unmount);
	return component;
}
let mounted_components = new WeakMap();
function unmount(component, options) {
	const fn = mounted_components.get(component);
	if (fn) {
		mounted_components.delete(component);
		return fn(options);
	}
	return Promise.resolve();
}

export { hydrate, mount, set_text, unmount };
