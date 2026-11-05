import '../npm/ztg-svelte-internal-disclose-version.js';
import { template_effect } from '../npm/ztg-svelte-internal-client-reactivity-effects.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { push, pop } from '../npm/ztg-svelte-internal-client-context.js';
import { flushSync } from '../npm/ztg-svelte-internal-client-reactivity-batch.js';
import { reset } from '../npm/ztg-svelte-internal-client-dom-hydration.js';
import { child, sibling, first_child } from '../npm/ztg-svelte-internal-client-dom-operations.js';
import { from_html, append, comment } from '../npm/ztg-svelte-internal-client-dom-template.js';
import { snippet } from '../npm/ztg-svelte-internal-client-dom-blocks-snippet.js';
import { if_block } from '../npm/ztg-svelte-internal-client-dom-blocks-if.js';
import { clsx } from '../npm/ztg-svelte-internal-shared-attributes.js';
import { set_class } from '../npm/ztg-svelte-internal-client-dom-elements-class.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import { prop } from '../npm/ztg-svelte-internal-client-reactivity-props.js';
import { create_custom_element } from '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import Dom_chef from './ztg-dom-chef.svelte.js';

var root = from_html(`<div><div class="d-sm-flex flex-items-center gap-2"><div class="d-flex flex-auto flex-self-center flex-items-center gap-2"><!> <span><!></span></div> <!></div></div>`);

function Banner($$anchor, $$props) {
	push($$props, true);

	const icon = prop($$props, 'icon', 7),
		text = prop($$props, 'text', 7),
		classes = prop($$props, 'classes', 23, () => []),
		children = prop($$props, 'children', 7);

	var $$exports = {
		get icon() {
			return icon();
		},

		set icon($$value) {
			icon($$value);
			flushSync();
		},

		get text() {
			return text();
		},

		set text($$value) {
			text($$value);
			flushSync();
		},

		get classes() {
			return classes();
		},

		set classes($$value = []) {
			classes($$value);
			flushSync();
		},

		get children() {
			return children();
		},

		set children($$value) {
			children($$value);
			flushSync();
		}
	};

	var div = root();
	var div_1 = child(div);
	var div_2 = child(div_1);
	var node = child(div_2);

	{
		var consequent = ($$anchor) => {
			Dom_chef($$anchor, {
				get as() {
					return icon();
				},
				class: 'mr-0 tmp-mr-0'
			});
		};

		if_block(node, ($$render) => {
			if (icon()) $$render(consequent);
		});
	}

	var span = sibling(node, 2);
	var node_1 = child(span);

	snippet(node_1, text);
	reset(span);
	reset(div_2);

	var node_2 = sibling(div_2, 2);

	{
		var consequent_1 = ($$anchor) => {
			var fragment_1 = comment();
			var node_3 = first_child(fragment_1);

			snippet(node_3, children);
			append($$anchor, fragment_1);
		};

		if_block(node_2, ($$render) => {
			if (children()) $$render(consequent_1);
		});
	}

	reset(div_1);
	reset(div);
	template_effect(($0) => set_class(div, 1, $0), [() => clsx(['flash', ...classes()].join(' '))]);
	append($$anchor, div);

	return pop($$exports);
}

create_custom_element(Banner, { icon: {}, text: {}, classes: {}, children: {} }, [], [], { mode: 'open' });

export { Banner as default };
