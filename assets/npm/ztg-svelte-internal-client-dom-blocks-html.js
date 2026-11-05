import { HYDRATION_ERROR, NAMESPACE_SVG, NAMESPACE_MATHML } from './ztg-svelte-constants.js';
import { template_effect, remove_effect_dom } from './ztg-svelte-internal-client-reactivity-effects.js';
import { hydrating, set_hydrate_node, hydrate_next, hydrate_node } from './ztg-svelte-internal-client-dom-hydration.js';
import { assign_nodes } from './ztg-svelte-internal-client-dom-template.js';
import { hydration_mismatch } from './ztg-svelte-internal-client-warnings.js';
import { active_effect } from './ztg-svelte-internal-client-runtime.js';
import { COMMENT_NODE } from './ztg-svelte-internal-client-constants.js';
import { get_first_child, create_element, get_next_sibling } from './ztg-svelte-internal-client-dom-operations.js';

function html(
	node,
	get_value,
	is_controlled = false,
	svg = false,
	mathml = false,
	skip_warning = false
) {
	var anchor = node;
	var value = '';
	if (is_controlled) {
		var parent_node =  (node);
		if (hydrating) {
			anchor = set_hydrate_node(get_first_child(parent_node));
		}
	}
	template_effect(() => {
		var effect =  (active_effect);
		if (value === (value = get_value() ?? '')) {
			if (hydrating) hydrate_next();
			return;
		}
		if (is_controlled && !hydrating) {
			effect.nodes = null;
			parent_node.innerHTML =  (value);
			if (value !== '') {
				assign_nodes(
					 (get_first_child(parent_node)),
					 (parent_node.lastChild)
				);
			}
			return;
		}
		if (effect.nodes !== null) {
			remove_effect_dom(effect.nodes.start,  (effect.nodes.end));
			effect.nodes = null;
		}
		if (value === '') return;
		if (hydrating) {
			(hydrate_node).data;
			var next = hydrate_next();
			var last = next;
			while (
				next !== null &&
				(next.nodeType !== COMMENT_NODE ||  (next).data !== '')
			) {
				last = next;
				next = get_next_sibling(next);
			}
			if (next === null) {
				hydration_mismatch();
				throw HYDRATION_ERROR;
			}
			assign_nodes(hydrate_node, last);
			anchor = set_hydrate_node(next);
			return;
		}
		var ns = svg ? NAMESPACE_SVG : mathml ? NAMESPACE_MATHML : undefined;
		var wrapper =  (
			create_element(svg ? 'svg' : mathml ? 'math' : 'template', ns)
		);
		wrapper.innerHTML =  (value);
		var node = svg || mathml ? wrapper :  (wrapper).content;
		assign_nodes(
			 (get_first_child(node)),
			 (node.lastChild)
		);
		if (svg || mathml) {
			while (get_first_child(node)) {
				anchor.before( (get_first_child(node)));
			}
		} else {
			anchor.before(node);
		}
	});
}

export { html };
