import '../npm/ztg-svelte-internal-disclose-version.js';
import { template_effect } from '../npm/ztg-svelte-internal-client-reactivity-effects.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { push, pop } from '../npm/ztg-svelte-internal-client-context.js';
import { flushSync } from '../npm/ztg-svelte-internal-client-reactivity-batch.js';
import { reset } from '../npm/ztg-svelte-internal-client-dom-hydration.js';
import { first_child, child } from '../npm/ztg-svelte-internal-client-dom-operations.js';
import { set_text } from '../npm/ztg-svelte-internal-client-render.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import { from_html, comment, append } from '../npm/ztg-svelte-internal-client-dom-template.js';
import { if_block } from '../npm/ztg-svelte-internal-client-dom-blocks-if.js';
import { prop } from '../npm/ztg-svelte-internal-client-reactivity-props.js';
import { setup_stores, store_get } from '../npm/ztg-svelte-internal-client-reactivity-store.js';
import { create_custom_element } from '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import abbreviateNumber from '../helpers/ztg-abbreviate-number.js';

var root = from_html(`<span class="Counter"> </span>`);

function Extensible_nav_counter($$anchor, $$props) {
	push($$props, true);

	const $counter = () => store_get(counter(), '$counter', $$stores);
	const [$$stores, $$cleanup] = setup_stores();
	const counter = prop($$props, 'counter', 7);

	var $$exports = {
		get counter() {
			return counter();
		},

		set counter($$value) {
			counter($$value);
			flushSync();
		}
	};

	var fragment = comment();
	var node = first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var span = root();
			var text = child(span, true);

			reset(span);

			template_effect(($0) => set_text(text, $0), [
				() => typeof $counter() === 'number' ? abbreviateNumber($counter()) : $counter()
			]);

			append($$anchor, span);
		};

		if_block(node, ($$render) => {
			if ($counter() !== undefined) $$render(consequent);
		});
	}

	append($$anchor, fragment);

	var $$pop = pop($$exports);

	$$cleanup();

	return $$pop;
}

create_custom_element(Extensible_nav_counter, { counter: {} }, [], [], { mode: 'open' });

export { Extensible_nav_counter as default };
