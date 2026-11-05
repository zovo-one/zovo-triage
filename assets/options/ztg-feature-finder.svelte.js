import '../npm/ztg-svelte-internal-disclose-version.js';
import { get } from '../npm/ztg-svelte-internal-client-runtime.js';
import { push, pop } from '../npm/ztg-svelte-internal-client-context.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { sibling, first_child, child } from '../npm/ztg-svelte-internal-client-dom-operations.js';
import { state, set } from '../npm/ztg-svelte-internal-client-reactivity-sources.js';
import { template_effect } from '../npm/ztg-svelte-internal-client-reactivity-effects.js';
import { reset } from '../npm/ztg-svelte-internal-client-dom-hydration.js';
import { delegate, delegated } from '../npm/ztg-svelte-internal-client-dom-elements-events.js';
import { from_html, append } from '../npm/ztg-svelte-internal-client-dom-template.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import { if_block } from '../npm/ztg-svelte-internal-client-dom-blocks-if.js';
import { create_custom_element } from '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import { startFeatureIdentification } from '../helpers/ztg-bisect.js';

var root = from_html(`<p>Visit the GitHub page where you want to find the feature and refresh it to
		see the instructions. You can navigate to any page, but don’t use multiple
		tabs.</p>`);

var root_1 = from_html(
	`<p>This process will help you identify what Refined GitHub feature is making
	changes or causing issues on GitHub.</p> <p><button>Start process to identify feature…</button></p> <!>`,
	1
);

function Feature_finder($$anchor, $$props) {
	push($$props, true);

	let disabled = state(false);
	let showMessage = state(false);

	async function findFeature() {
		await startFeatureIdentification();
		set(disabled, true);

		setTimeout(
			() => {
				set(disabled, false);
			},
			10_000
		);

		set(showMessage, true);
	}

	var fragment = root_1();
	var p = sibling(first_child(fragment), 2);
	var button = child(p);

	reset(p);

	var node = sibling(p, 2);

	{
		var consequent = ($$anchor) => {
			var p_1 = root();

			append($$anchor, p_1);
		};

		if_block(node, ($$render) => {
			if (get(showMessage)) $$render(consequent);
		});
	}

	template_effect(() => button.disabled = get(disabled));
	delegated('click', button, findFeature);
	append($$anchor, fragment);
	pop();
}

delegate(['click']);
create_custom_element(Feature_finder, {}, [], [], { mode: 'open' });

export { Feature_finder as default };
