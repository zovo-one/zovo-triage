import '../npm/ztg-svelte-internal-disclose-version.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { push, pop } from '../npm/ztg-svelte-internal-client-context.js';
import { flushSync } from '../npm/ztg-svelte-internal-client-reactivity-batch.js';
import { from_html, append } from '../npm/ztg-svelte-internal-client-dom-template.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import { action } from '../npm/ztg-svelte-internal-client-dom-elements-actions.js';
import { prop, rest_props } from '../npm/ztg-svelte-internal-client-reactivity-props.js';
import { create_custom_element } from '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import React from '../npm/ztg-dom-chef.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', '$$host', 'as']);
var root = from_html(`<span></span>`);

function Dom_chef($$anchor, $$props) {
	push($$props, true);

	// eslint-disable-next-line svelte/no-unused-svelte-ignore
	// svelte-ignore custom_element_props_identifier -- No custom element here
	const as = prop($$props, 'as', 7),
		props = rest_props($$props, rest_excludes);

	const mount = (node) => {
		const element = React.createElement(as(), props);

		if (element instanceof DocumentFragment) {
			throw new TypeError('The component must return a single root element');
		}

		node.replaceWith(element);

		return { destroy: () => element.remove() };
	};

	var $$exports = {
		get as() {
			return as();
		},

		set as($$value) {
			as($$value);
			flushSync();
		}
	};

	var span = root();

	action(span, ($$node) => mount?.($$node));
	append($$anchor, span);

	return pop($$exports);
}

create_custom_element(Dom_chef, { as: {} }, [], [], { mode: 'open' });

export { Dom_chef as default };
