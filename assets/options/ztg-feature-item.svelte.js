import '../npm/ztg-svelte-internal-disclose-version.js';
import { get } from '../npm/ztg-svelte-internal-client-runtime.js';
import { push, pop } from '../npm/ztg-svelte-internal-client-context.js';
import { flushSync } from '../npm/ztg-svelte-internal-client-reactivity-batch.js';
import { reset, next } from '../npm/ztg-svelte-internal-client-dom-hydration.js';
import { set_text } from '../npm/ztg-svelte-internal-client-render.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { template_effect } from '../npm/ztg-svelte-internal-client-reactivity-effects.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import { from_html, append } from '../npm/ztg-svelte-internal-client-dom-template.js';
import { first_child, sibling, child } from '../npm/ztg-svelte-internal-client-dom-operations.js';
import { state, set } from '../npm/ztg-svelte-internal-client-reactivity-sources.js';
import { user_derived } from '../npm/ztg-svelte-internal-client-reactivity-deriveds.js';
import { if_block } from '../npm/ztg-svelte-internal-client-dom-blocks-if.js';
import { html } from '../npm/ztg-svelte-internal-client-dom-blocks-html.js';
import { append_styles } from '../npm/ztg-svelte-internal-client-dom-css.js';
import { set_attribute } from '../npm/ztg-svelte-internal-client-dom-elements-attributes.js';
import { delegate, delegated } from '../npm/ztg-svelte-internal-client-dom-elements-events.js';
import { bind_this } from '../npm/ztg-svelte-internal-client-dom-elements-bindings-this.js';
import { prop } from '../npm/ztg-svelte-internal-client-reactivity-props.js';
import { create_custom_element } from '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import { $$ } from '../npm/ztg-select-dom.js';
import Dom_chef from '../components/ztg-dom-chef.svelte.js';
import { getFeatureUrl, createRghIssueLink } from '../helpers/ztg-rgh-links.js';

var root = from_html(`<span class="hotfix-notice svelte-n6wrmd">(Disabled due to <!>)</span>`);
var root_1 = from_html(`<a class="screenshot-link svelte-n6wrmd">screenshot</a>`);
var root_2 = from_html(`<img hidden="" loading="lazy" class="screenshot svelte-n6wrmd"/>`);
var root_3 = from_html(`<input type="checkbox" class="feature-checkbox svelte-n6wrmd"/> <div class="info svelte-n6wrmd"><label class="feature-name svelte-n6wrmd"> </label> <!> <a class="feature-link svelte-n6wrmd">source</a> <input hidden="" type="checkbox" class="screenshot-toggle svelte-n6wrmd"/> <!> <div class="description svelte-n6wrmd"></div> <!></div>`, 1);

const $$css = {
	hash: 'svelte-n6wrmd',
	code: '\n	@keyframes svelte-n6wrmd-blink-border {\n		50% {\n			outline-color: #1f6feb;\n		}\n	}input[type=\'checkbox\'].svelte-n6wrmd {flex-shrink:0;scroll-margin-top:64px;}.feature-checkbox.svelte-n6wrmd:not(:checked) + .info:where(.svelte-n6wrmd) .feature-name:where(.svelte-n6wrmd) {text-decoration:line-through;}.feature-checkbox.svelte-n6wrmd:disabled {&, & + .info:where(.svelte-n6wrmd) {opacity:50%;}}.info.svelte-n6wrmd {flex:1;}.description.svelte-n6wrmd {opacity:80%;}.feature-link.svelte-n6wrmd {margin:0 0.6em;}.screenshot.svelte-n6wrmd {max-width:100%;margin-bottom:2em;border:1px solid #d1d5da;border-radius:0.5em;min-width:2em;min-height:2em;}.screenshot-toggle.svelte-n6wrmd:checked ~ .screenshot-link:where(.svelte-n6wrmd) {font-style:italic;}.screenshot-toggle.svelte-n6wrmd:checked ~ .screenshot:where(.svelte-n6wrmd) {display:block;}\n\n	/* Svelte can\'t find the "a" so it will report it as missing */.hotfix-notice,\n	.hotfix-notice a {color:var(--rgh-red);}'
};

function Feature_item($$anchor, $$props) {
	push($$props, true);
	append_styles($$anchor, $$css);

	const id = prop($$props, 'id', 7),
		description = prop($$props, 'description', 7),
		screenshot = prop($$props, 'screenshot', 7),
		hotfixIssue = prop($$props, 'hotfixIssue', 7);

	// eslint-disable-next-line no-undef
	// eslint-disable-next-line no-undef
	const fieldId = user_derived(() => `field-${id()}`);

	let screenshotToggle = state(void 0);

	function toggleScreenshot(event) {
		if (event.ctrlKey || event.metaKey || event.shiftKey) {
			return;
		}

		event.preventDefault();

		if (event.altKey) {
			// Global batch toggle across all instances
			const toggles = $$('input.screenshot-toggle');

			for (const toggle of toggles) {
				toggle.checked = !toggle.checked;
				toggle.dispatchEvent(new Event('change', { bubbles: true }));
			}
		} else if (get(screenshotToggle)) {
			// Local instance toggle
			get(screenshotToggle).checked = !get(screenshotToggle).checked;
		}
	}

	var $$exports = {
		get id() {
			return id();
		},

		set id($$value) {
			id($$value);
			flushSync();
		},

		get description() {
			return description();
		},

		set description($$value) {
			description($$value);
			flushSync();
		},

		get screenshot() {
			return screenshot();
		},

		set screenshot($$value) {
			screenshot($$value);
			flushSync();
		},

		get hotfixIssue() {
			return hotfixIssue();
		},

		set hotfixIssue($$value) {
			hotfixIssue($$value);
			flushSync();
		}
	};

	var fragment = root_3();
	var input = first_child(fragment);
	var div = sibling(input, 2);
	var label = child(div);
	var text = child(label, true);

	reset(label);

	var node = sibling(label, 2);

	{
		var consequent = ($$anchor) => {
			var span = root();
			var node_1 = sibling(child(span));

			Dom_chef(node_1, { as: () => createRghIssueLink(hotfixIssue(), true) });
			next();
			reset(span);
			append($$anchor, span);
		};

		if_block(node, ($$render) => {
			if (hotfixIssue()) $$render(consequent);
		});
	}

	var a = sibling(node, 2);
	var input_1 = sibling(a, 2);

	bind_this(input_1, ($$value) => set(screenshotToggle, $$value), () => get(screenshotToggle));

	var node_2 = sibling(input_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			var a_1 = root_1();

			template_effect(() => set_attribute(a_1, 'href', screenshot()));
			delegated('click', a_1, toggleScreenshot);
			append($$anchor, a_1);
		};

		if_block(node_2, ($$render) => {
			if (screenshot()) $$render(consequent_1);
		});
	}

	var div_1 = sibling(node_2, 2);

	html(div_1, description, true);
	reset(div_1);

	var node_3 = sibling(div_1, 2);

	{
		var consequent_2 = ($$anchor) => {
			var img = root_2();

			template_effect(() => {
				set_attribute(img, 'src', screenshot());
				set_attribute(img, 'alt', `Screenshot of ${id()} feature`);
			});

			append($$anchor, img);
		};

		if_block(node_3, ($$render) => {
			if (screenshot()) $$render(consequent_2);
		});
	}

	reset(div);

	template_effect(
		($0, $1) => {
			set_attribute(input, 'name', hotfixIssue() ? null : `feature:${id()}`);
			set_attribute(input, 'id', get(fieldId));
			input.disabled = $0;
			set_attribute(label, 'for', get(fieldId));
			set_text(text, id());
			set_attribute(a, 'href', $1);
		},
		[() => Boolean(hotfixIssue()), () => getFeatureUrl(id())]
	);

	append($$anchor, fragment);

	return pop($$exports);
}

delegate(['click']);
create_custom_element(Feature_item, { id: {}, description: {}, screenshot: {}, hotfixIssue: {} }, [], [], { mode: 'open' });

export { Feature_item as default };
