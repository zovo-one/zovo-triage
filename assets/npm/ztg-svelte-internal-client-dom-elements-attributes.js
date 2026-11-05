import { hydrating, set_hydrating } from './ztg-svelte-internal-client-dom-hydration.js';
import { get_prototype_of, get_descriptors } from './ztg-svelte-internal-shared-utils.js';
import { set_active_reaction, set_active_effect, active_reaction, active_effect } from './ztg-svelte-internal-client-runtime.js';
import { LOADING_ATTR_SYMBOL, ATTRIBUTES_CACHE, IS_XHTML, FORM_RESET_HANDLER } from './ztg-svelte-internal-client-constants.js';
import { NAMESPACE_HTML } from './ztg-svelte-constants.js';
import { queue_micro_task } from './ztg-svelte-internal-client-dom-task.js';
import { add_form_reset_listener } from './ztg-svelte-internal-client-dom-elements-misc.js';

const IS_CUSTOM_ELEMENT = Symbol('is custom element');
const IS_HTML = Symbol('is html');
const LINK_TAG = IS_XHTML ? 'link' : 'LINK';
const PROGRESS_TAG = IS_XHTML ? 'progress' : 'PROGRESS';
function remove_input_defaults(input) {
	if (!hydrating) return;
	var already_removed = false;
	var remove_defaults = () => {
		if (already_removed) return;
		already_removed = true;
		if (input.hasAttribute('value')) {
			var value = input.value;
			set_attribute(input, 'value', null);
			input.value = value;
		}
		if (input.hasAttribute('checked')) {
			var checked = input.checked;
			set_attribute(input, 'checked', null);
			input.checked = checked;
		}
	};
	 (input)[FORM_RESET_HANDLER] = remove_defaults;
	queue_micro_task(remove_defaults);
	add_form_reset_listener();
}
function set_value(element, value) {
	var attributes = get_attributes(element);
	if (
		attributes.value ===
			(attributes.value =
				value ?? undefined) ||
		(element.value === value && (value !== 0 || element.nodeName !== PROGRESS_TAG))
	) {
		return;
	}
	element.value = value ?? '';
}
function set_attribute(element, attribute, value, skip_warning) {
	var attributes = get_attributes(element);
	if (hydrating) {
		attributes[attribute] = element.getAttribute(attribute);
		if (
			attribute === 'src' ||
			attribute === 'srcset' ||
			(attribute === 'href' && element.nodeName === LINK_TAG)
		) {
			return;
		}
	}
	if (attributes[attribute] === (attributes[attribute] = value)) return;
	if (attribute === 'loading') {
		element[LOADING_ATTR_SYMBOL] = value;
	}
	if (value == null) {
		element.removeAttribute(attribute);
	} else if (typeof value !== 'string' && get_setters(element).includes(attribute)) {
		element[attribute] = value;
	} else {
		element.setAttribute(attribute, value);
	}
}
function set_custom_element_data(node, prop, value) {
	var previous_reaction = active_reaction;
	var previous_effect = active_effect;
	let was_hydrating = hydrating;
	if (hydrating) {
		set_hydrating(false);
	}
	set_active_reaction(null);
	set_active_effect(null);
	try {
		if (
			prop !== 'style' &&
			(setters_cache.has(node.getAttribute('is') || node.nodeName) ||
			!customElements ||
			customElements.get(node.getAttribute('is') || node.nodeName.toLowerCase())
				? get_setters(node).includes(prop)
				: value && typeof value === 'object')
		) {
			node[prop] = value;
		} else {
			set_attribute(node, prop, value == null ? value : String(value));
		}
	} finally {
		set_active_reaction(previous_reaction);
		set_active_effect(previous_effect);
		if (was_hydrating) {
			set_hydrating(true);
		}
	}
}
function get_attributes(element) {
	return  (
		 (element)[ATTRIBUTES_CACHE] ??= {
			[IS_CUSTOM_ELEMENT]: element.nodeName.includes('-'),
			[IS_HTML]: element.namespaceURI === NAMESPACE_HTML
		}
	);
}
var setters_cache = new Map();
function get_setters(element) {
	var cache_key = element.getAttribute('is') || element.nodeName;
	var setters = setters_cache.get(cache_key);
	if (setters) return setters;
	setters_cache.set(cache_key, (setters = []));
	var descriptors;
	var proto = element;
	var element_proto = Element.prototype;
	while (element_proto !== proto) {
		descriptors = get_descriptors(proto);
		for (var key in descriptors) {
			if (
				descriptors[key].set &&
				key !== 'innerHTML' &&
				key !== 'textContent' &&
				key !== 'innerText'
			) {
				setters.push(key);
			}
		}
		proto = get_prototype_of(proto);
	}
	return setters;
}

export { remove_input_defaults, set_attribute, set_custom_element_data, set_value };
