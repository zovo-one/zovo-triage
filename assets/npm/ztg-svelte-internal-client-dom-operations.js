import { hydrate_node, hydrating, set_hydrate_node } from './ztg-svelte-internal-client-dom-hydration.js';
import { get_descriptor, is_extensible } from './ztg-svelte-internal-shared-utils.js';
import { CLASS_CACHE, ATTRIBUTES_CACHE, STYLE_CACHE, TEXT_CACHE, TEXT_NODE } from './ztg-svelte-internal-client-constants.js';
import { NAMESPACE_HTML } from './ztg-svelte-constants.js';

var $window;
var is_firefox;
var first_child_getter;
var next_sibling_getter;
function init_operations() {
	if ($window !== undefined) {
		return;
	}
	$window = window;
	is_firefox = /Firefox/.test(navigator.userAgent);
	var element_prototype = Element.prototype;
	var node_prototype = Node.prototype;
	var text_prototype = Text.prototype;
	first_child_getter = get_descriptor(node_prototype, 'firstChild').get;
	next_sibling_getter = get_descriptor(node_prototype, 'nextSibling').get;
	if (is_extensible(element_prototype)) {
		 (element_prototype)[CLASS_CACHE] = undefined;
		 (element_prototype)[ATTRIBUTES_CACHE] = null;
		 (element_prototype)[STYLE_CACHE] = undefined;
		element_prototype.__e = undefined;
	}
	if (is_extensible(text_prototype)) {
		 (text_prototype)[TEXT_CACHE] = undefined;
	}
}
function create_text(value = '') {
	return document.createTextNode(value);
}
function get_first_child(node) {
	return  (first_child_getter.call(node));
}
function get_next_sibling(node) {
	return  (next_sibling_getter.call(node));
}
function child(node, is_text) {
	if (!hydrating) {
		return get_first_child(node);
	}
	var child = get_first_child(hydrate_node);
	if (child === null) {
		child = hydrate_node.appendChild(create_text());
	} else if (is_text && child.nodeType !== TEXT_NODE) {
		var text = create_text();
		child?.before(text);
		set_hydrate_node(text);
		return text;
	}
	if (is_text) {
		merge_text_nodes( (child));
	}
	set_hydrate_node(child);
	return child;
}
function first_child(node, is_text = false) {
	if (!hydrating) {
		var first = get_first_child(node);
		if (first instanceof Comment && first.data === '') return get_next_sibling(first);
		return first;
	}
	if (is_text) {
		if (hydrate_node?.nodeType !== TEXT_NODE) {
			var text = create_text();
			hydrate_node?.before(text);
			set_hydrate_node(text);
			return text;
		}
		merge_text_nodes( (hydrate_node));
	}
	return hydrate_node;
}
function sibling(node, count = 1, is_text = false) {
	let next_sibling = hydrating ? hydrate_node : node;
	var last_sibling;
	while (count--) {
		last_sibling = next_sibling;
		next_sibling =  (get_next_sibling(next_sibling));
	}
	if (!hydrating) {
		return next_sibling;
	}
	if (is_text) {
		if (next_sibling?.nodeType !== TEXT_NODE) {
			var text = create_text();
			if (next_sibling === null) {
				last_sibling?.after(text);
			} else {
				next_sibling.before(text);
			}
			set_hydrate_node(text);
			return text;
		}
		merge_text_nodes( (next_sibling));
	}
	set_hydrate_node(next_sibling);
	return next_sibling;
}
function clear_text_content(node) {
	node.textContent = '';
}
function should_defer_append() {
	return false;
}
function create_element(tag, namespace, is) {
	if (namespace == null || namespace === NAMESPACE_HTML) {
		return  (
			is ? document.createElement(tag, { is }) : document.createElement(tag)
		);
	}
	return  (
		is ? document.createElementNS(namespace, tag, { is }) : document.createElementNS(namespace, tag)
	);
}
function merge_text_nodes(text) {
	if ( (text.nodeValue).length < 65536) {
		return;
	}
	let next = text.nextSibling;
	while (next !== null && next.nodeType === TEXT_NODE) {
		next.remove();
		 (text.nodeValue) +=  (next.nodeValue);
		next = text.nextSibling;
	}
}

export { $window, child, clear_text_content, create_element, create_text, first_child, get_first_child, get_next_sibling, init_operations, is_firefox, merge_text_nodes, should_defer_append, sibling };
