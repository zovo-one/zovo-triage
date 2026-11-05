import '../npm/ztg-svelte-internal-disclose-version.js';
import { get } from '../npm/ztg-svelte-internal-client-runtime.js';
import { push, pop } from '../npm/ztg-svelte-internal-client-context.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { first_child, child, sibling } from '../npm/ztg-svelte-internal-client-dom-operations.js';
import { state, set } from '../npm/ztg-svelte-internal-client-reactivity-sources.js';
import { template_effect } from '../npm/ztg-svelte-internal-client-reactivity-effects.js';
import { user_derived } from '../npm/ztg-svelte-internal-client-reactivity-deriveds.js';
import { reset } from '../npm/ztg-svelte-internal-client-dom-hydration.js';
import { from_html, append } from '../npm/ztg-svelte-internal-client-dom-template.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import { await_block } from '../npm/ztg-svelte-internal-client-dom-blocks-await.js';
import { each } from '../npm/ztg-svelte-internal-client-dom-blocks-each.js';
import { append_styles } from '../npm/ztg-svelte-internal-client-dom-css.js';
import { remove_input_defaults, set_attribute } from '../npm/ztg-svelte-internal-client-dom-elements-attributes.js';
import { set_style } from '../npm/ztg-svelte-internal-client-dom-elements-style.js';
import { bind_value } from '../npm/ztg-svelte-internal-client-dom-elements-bindings-input.js';
import { create_custom_element } from '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import { featuresMeta, importedFeatures } from '../ztg-feature-data.js';
import { brokenFeatures } from '../helpers/ztg-hotfix.js';
import Feature_item from './ztg-feature-item.svelte.js';

var root = from_html(`<div class="feature-item svelte-129h24s"><!></div>`);
var root_1 = from_html(`<div class="js-features"></div>`);

var root_2 = from_html(
	`<p><input type="text" placeholder="Find features" spellcheck="false" autocomplete="off" autocapitalize="off"/> <small>Use the "Identify feature" section below if you can't find what you're
		looking for.</small></p> <!>`,
	1
);

const $$css = {
	hash: 'svelte-129h24s',
	code: '.feature-item.svelte-129h24s:not([hidden]) {display:flex;align-items:baseline;flex-wrap:wrap;gap:0 0.4em;padding:0.5em 0;}.feature-item.svelte-129h24s:first-of-type {padding-top:0;}.feature-item.svelte-129h24s:target {outline:solid 2px transparent;border-radius:var(--border-radius);\n		animation-name: blink-border;animation-duration:1.5s;animation-iteration-count:2;scroll-margin-top:64px;}'
};

function Feature_list($$anchor, $$props) {
	push($$props, true);
	append_styles($$anchor, $$css);

	let filterText = state('');

	// This will attempt to load the hotfixes because we do want an up-to-date options page
	const hotfixesPromise = brokenFeatures.get();

	// Pre-filter valid imported features
	const activeFeatures = featuresMeta.filter((feature) => importedFeatures.includes(feature.id));

	var fragment = root_2();
	var p = first_child(fragment);
	var input = child(p);

	remove_input_defaults(input);

	var small = sibling(input, 2);

	set_style(small, '', {}, { opacity: '80%' });
	reset(p);

	var node = sibling(p, 2);

	await_block(node, () => hotfixesPromise, null, ($$anchor, fixes) => {
		var div = root_1();

		each(div, 21, () => activeFeatures, (feature) => feature.id, ($$anchor, feature) => {
			const searchText = user_derived(() => `${get(feature).id} ${get(feature).description}`.toLowerCase());
			const keywords = user_derived(() => get(filterText).toLowerCase().replaceAll(/\W/g, ' ').split(/\s+/).filter(Boolean));
			const hotfixIssue = user_derived(() => get(fixes).find(([hotfixId]) => hotfixId === get(feature).id)?.[1]);
			var div_1 = root();
			var node_1 = child(div_1);

			Feature_item(node_1, {
				get id() {
					return get(feature).id;
				},

				get description() {
					return get(feature).description;
				},

				get screenshot() {
					return get(feature).screenshot;
				},

				get hotfixIssue() {
					return get(hotfixIssue);
				}
			});

			reset(div_1);

			template_effect(
				($0) => {
					set_attribute(div_1, 'data-text', get(searchText));
					set_attribute(div_1, 'hidden', $0);
				},
				[
					() => get(keywords).some((word) => !get(searchText).includes(word))
				]
			);

			append($$anchor, div_1);
		});

		reset(div);
		append($$anchor, div);
	});

	bind_value(input, () => get(filterText), ($$value) => set(filterText, $$value));
	append($$anchor, fragment);
	pop();
}

create_custom_element(Feature_list, {}, [], [], { mode: 'open' });

export { Feature_list as default };
