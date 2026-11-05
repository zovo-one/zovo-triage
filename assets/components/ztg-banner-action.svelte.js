import '../npm/ztg-svelte-internal-disclose-version.js';
import { template_effect } from '../npm/ztg-svelte-internal-client-reactivity-effects.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { push, pop } from '../npm/ztg-svelte-internal-client-context.js';
import { flushSync } from '../npm/ztg-svelte-internal-client-reactivity-batch.js';
import { reset } from '../npm/ztg-svelte-internal-client-dom-hydration.js';
import { first_child, child } from '../npm/ztg-svelte-internal-client-dom-operations.js';
import { delegate, delegated } from '../npm/ztg-svelte-internal-client-dom-elements-events.js';
import { from_html, comment, append } from '../npm/ztg-svelte-internal-client-dom-template.js';
import { snippet } from '../npm/ztg-svelte-internal-client-dom-blocks-snippet.js';
import { if_block } from '../npm/ztg-svelte-internal-client-dom-blocks-if.js';
import { set_attribute } from '../npm/ztg-svelte-internal-client-dom-elements-attributes.js';
import { set_class } from '../npm/ztg-svelte-internal-client-dom-elements-class.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import { clsx } from '../npm/ztg-svelte-internal-shared-attributes.js';
import { prop } from '../npm/ztg-svelte-internal-client-reactivity-props.js';
import { create_custom_element } from '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';

var root = from_html(`<a><!></a>`);
var root_1 = from_html(`<button type="button"><!></button>`);

function Banner_action($$anchor, $$props) {
	push($$props, true);

	const action = prop($$props, 'action', 7),
		children = prop($$props, 'children', 7);

	const buttonClasses = 'flex-shrink-0 btn btn-sm ml-sm-3 mt-2 mt-sm-n2 mb-sm-n2 mr-sm-n1 flex-self-center';

	var $$exports = {
		get action() {
			return action();
		},

		set action($$value) {
			action($$value);
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

	var fragment = comment();
	var node = first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var a = root();

			set_class(a, 1, clsx(buttonClasses));

			var node_1 = child(a);

			snippet(node_1, children);
			reset(a);
			template_effect(() => set_attribute(a, 'href', action()));
			append($$anchor, a);
		};

		var consequent_1 = ($$anchor) => {
			var button = root_1();

			set_class(button, 1, clsx(buttonClasses));

			var node_2 = child(button);

			snippet(node_2, children);
			reset(button);

			delegated('click', button, function (...$$args) {
				action()?.apply(this, $$args);
			});

			append($$anchor, button);
		};

		if_block(node, ($$render) => {
			if (typeof action() === 'string') $$render(consequent); else if (typeof action() === 'function') $$render(consequent_1, 1);
		});
	}

	append($$anchor, fragment);

	return pop($$exports);
}

delegate(['click']);
create_custom_element(Banner_action, { action: {}, children: {} }, [], [], { mode: 'open' });

export { Banner_action as default };
