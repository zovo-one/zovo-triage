import '../npm/ztg-svelte-internal-disclose-version.js';
import '../npm/ztg-svelte-internal-flags-legacy.js';
import { get } from '../npm/ztg-svelte-internal-client-runtime.js';
import { template_effect } from '../npm/ztg-svelte-internal-client-reactivity-effects.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { child, sibling } from '../npm/ztg-svelte-internal-client-dom-operations.js';
import { derived_safe_equal } from '../npm/ztg-svelte-internal-client-reactivity-deriveds.js';
import { store_get, setup_stores } from '../npm/ztg-svelte-internal-client-reactivity-store.js';
import { reset } from '../npm/ztg-svelte-internal-client-dom-hydration.js';
import { set_text } from '../npm/ztg-svelte-internal-client-render.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import { from_html, append } from '../npm/ztg-svelte-internal-client-dom-template.js';
import { if_block } from '../npm/ztg-svelte-internal-client-dom-blocks-if.js';
import { each } from '../npm/ztg-svelte-internal-client-dom-blocks-each.js';
import { append_styles } from '../npm/ztg-svelte-internal-client-dom-css.js';
import { set_attribute } from '../npm/ztg-svelte-internal-client-dom-elements-attributes.js';
import { set_class } from '../npm/ztg-svelte-internal-client-dom-elements-class.js';
import { create_custom_element } from '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import Dom_chef from '../components/ztg-dom-chef.svelte.js';
import Extensible_nav_counter from '../components/ztg-extensible-nav-counter.svelte.js';
import { tabs, selectedId } from '../components/ztg-extensible-nav-store.js';
import Tooltip from '../components/ztg-tooltip.svelte.js';

var root = from_html(`<li><a data-turbo-frame="repo-content-turbo-frame"><!> <span> </span> <!></a> <!></li>`);
var root_1 = from_html(`<nav class="UnderlineNav rgh-extensible-nav d-none px-4"><ul class="UnderlineNav-body"></ul></nav>`);

const $$css = {
	hash: 'svelte-1u9ps3z',
	code: 'a.svelte-1u9ps3z {min-height:1lh;gap:8px;svg, .Counter {margin:0;}}.demoted.svelte-1u9ps3z:nth-child(1 of .demoted) {margin-left:16px;}'
};

function Extensible_nav($$anchor) {
	append_styles($$anchor, $$css);

	const $tabs = () => store_get(tabs, '$tabs', $$stores);
	const $selectedId = () => store_get(selectedId, '$selectedId', $$stores);
	const [$$stores, $$cleanup] = setup_stores();
	var nav = root_1();
	var ul = child(nav);

	each(ul, 5, $tabs, (tab) => tab.id, ($$anchor, tab) => {
		const id = derived_safe_equal(() => `rgh-extensible-nav-${get(tab).id}`);
		const isSelected = derived_safe_equal(() => get(tab).id === $selectedId());
		const hasLabel = derived_safe_equal(() => !get(tab).demoted || get(isSelected));
		const tooltip = derived_safe_equal(() => get(tab).tooltip ?? (get(hasLabel) ? undefined : get(tab).label));
		var li = root();
		let classes;
		var a = child(li);
		let classes_1;
		var node = child(a);

		Dom_chef(node, {
			get as() {
				return get(tab).icon;
			},
			class: 'UnderlineNav-octicon'
		});

		var span = sibling(node, 2);
		let classes_2;
		var text = child(span, true);

		reset(span);

		var node_1 = sibling(span, 2);

		Extensible_nav_counter(node_1, {
			get counter() {
				return get(tab).counter;
			}
		});

		reset(a);

		var node_2 = sibling(a, 2);

		{
			var consequent = ($$anchor) => {
				{
					let $0 = derived_safe_equal(() => typeof get(tab).demoted === 'string'
						? `${get(tab).label}: ${get(tab).demoted}`
						: get(tooltip));

					Tooltip($$anchor, {
						get id() {
							return `${get(id) ?? ''}-tooltip`;
						},

						get htmlFor() {
							return get(id);
						},

						get label() {
							return get($0);
						}
					});
				}
			};

			if_block(node_2, ($$render) => {
				if (get(tooltip)) $$render(consequent);
			});
		}

		reset(li);

		template_effect(() => {
			set_attribute(li, 'hidden', get(tab).removed);
			classes = set_class(li, 1, 'svelte-1u9ps3z', null, classes, { demoted: get(tab).demoted });
			set_attribute(a, 'id', get(id));
			set_attribute(a, 'href', get(tab).href);
			classes_1 = set_class(a, 1, 'UnderlineNav-item svelte-1u9ps3z', null, classes_1, { selected: get(isSelected) });
			set_attribute(a, 'data-react-nav', get(tab).reactNav);
			set_attribute(a, 'aria-labelledby', get(tooltip) ? `${get(id)}-tooltip` : undefined);
			set_attribute(span, 'data-content', get(tab).label);
			classes_2 = set_class(span, 1, '', null, classes_2, { 'd-none': !get(hasLabel) });
			set_text(text, get(tab).label);
		});

		append($$anchor, li);
	});

	reset(ul);
	reset(nav);
	append($$anchor, nav);
	$$cleanup();
}

create_custom_element(Extensible_nav, {}, [], [], { mode: 'open' });

export { Extensible_nav as default };
