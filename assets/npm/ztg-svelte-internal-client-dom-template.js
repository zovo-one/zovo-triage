import { hydrating, hydrate_node, set_hydrate_node, hydrate_next } from './ztg-svelte-internal-client-dom-hydration.js';
import { get_first_child, create_text, is_firefox, merge_text_nodes } from './ztg-svelte-internal-client-dom-operations.js';
import { create_fragment_from_html } from './ztg-svelte-internal-client-dom-reconciler.js';
import { active_effect } from './ztg-svelte-internal-client-runtime.js';
import { TEMPLATE_FRAGMENT, TEMPLATE_USE_IMPORT_NODE } from './ztg-svelte-constants.js';
import { TEXT_NODE, REACTION_RAN } from './ztg-svelte-internal-client-constants.js';

function assign_nodes(start, end) {
	var effect =  (active_effect);
	if (effect.nodes === null) {
		effect.nodes = { start, end, a: null, t: null };
	}
}
function from_html(content, flags) {
	var is_fragment = (flags & TEMPLATE_FRAGMENT) !== 0;
	var use_import_node = (flags & TEMPLATE_USE_IMPORT_NODE) !== 0;
	var node;
	var has_start = !content.startsWith('<!>');
	return () => {
		if (hydrating) {
			assign_nodes(hydrate_node, null);
			return hydrate_node;
		}
		if (node === undefined) {
			node = create_fragment_from_html(has_start ? content : '<!>' + content);
			if (!is_fragment) node =  (get_first_child(node));
		}
		var clone =  (
			use_import_node || is_firefox ? document.importNode(node, true) : node.cloneNode(true)
		);
		if (is_fragment) {
			var start =  (get_first_child(clone));
			var end =  (clone.lastChild);
			assign_nodes(start, end);
		} else {
			assign_nodes(clone, clone);
		}
		return clone;
	};
}
function text(value = '') {
	if (!hydrating) {
		var t = create_text(value + '');
		assign_nodes(t, t);
		return t;
	}
	var node = hydrate_node;
	if (node.nodeType !== TEXT_NODE) {
		node.before((node = create_text()));
		set_hydrate_node(node);
	} else {
		merge_text_nodes( (node));
	}
	assign_nodes(node, node);
	return node;
}
function comment() {
	if (hydrating) {
		assign_nodes(hydrate_node, null);
		return hydrate_node;
	}
	var frag = document.createDocumentFragment();
	var start = document.createComment('');
	var anchor = create_text();
	frag.append(start, anchor);
	assign_nodes(start, anchor);
	return frag;
}
function append(anchor, dom) {
	if (hydrating) {
		var effect =  (active_effect);
		if ((effect.f & REACTION_RAN) === 0 || effect.nodes.end === null) {
			effect.nodes.end = hydrate_node;
		}
		hydrate_next();
		return;
	}
	if (anchor === null) {
		return;
	}
	anchor.before( (dom));
}

export { append, assign_nodes, comment, from_html, text };
