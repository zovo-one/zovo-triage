import '../npm/ztg-svelte-internal-disclose-version.js';
import { template_effect } from '../npm/ztg-svelte-internal-client-reactivity-effects.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { push, pop } from '../npm/ztg-svelte-internal-client-context.js';
import { flushSync } from '../npm/ztg-svelte-internal-client-reactivity-batch.js';
import { reset } from '../npm/ztg-svelte-internal-client-dom-hydration.js';
import { first_child, child, sibling } from '../npm/ztg-svelte-internal-client-dom-operations.js';
import { set_text } from '../npm/ztg-svelte-internal-client-render.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import { from_html, append } from '../npm/ztg-svelte-internal-client-dom-template.js';
import { append_styles } from '../npm/ztg-svelte-internal-client-dom-css.js';
import { set_attribute, set_value } from '../npm/ztg-svelte-internal-client-dom-elements-attributes.js';
import { set_class } from '../npm/ztg-svelte-internal-client-dom-elements-class.js';
import { delegate, delegated } from '../npm/ztg-svelte-internal-client-dom-elements-events.js';
import { set_style } from '../npm/ztg-svelte-internal-client-dom-elements-style.js';
import { prop } from '../npm/ztg-svelte-internal-client-reactivity-props.js';
import { create_custom_element } from '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import Dom_chef from './ztg-dom-chef.svelte.js';
import Tooltip from './ztg-tooltip.svelte.js';

var root = from_html(`<button name="id"><!> </button> <!>`, 1);

const $$css = {
	hash: 'svelte-3dffmc',
	code: 'button.svelte-3dffmc:not(.selected) {color:var(--fgColor-muted, var(--color-fg-muted, fuchsia));}button.selected.svelte-3dffmc {border-color:var(\n			--control-borderColor-emphasis,\n			var(--color-accent-emphasis, fuchsia)\n		);svg {color:var(--fgColor-default, var(--color-fg-default, fuchsia));}}'
};

function Status_subscription_button($$anchor, $$props) {
	push($$props, true);
	append_styles($$anchor, $$css);

	const id = prop($$props, 'id', 7),
		value = prop($$props, 'value', 7),
		icon = prop($$props, 'icon', 7),
		label = prop($$props, 'label', 7),
		tooltip = prop($$props, 'tooltip', 7),
		active = prop($$props, 'active', 7),
		isLegacy = prop($$props, 'isLegacy', 7),
		onclick = prop($$props, 'onclick', 7);

	var $$exports = {
		get id() {
			return id();
		},

		set id($$value) {
			id($$value);
			flushSync();
		},

		get value() {
			return value();
		},

		set value($$value) {
			value($$value);
			flushSync();
		},

		get icon() {
			return icon();
		},

		set icon($$value) {
			icon($$value);
			flushSync();
		},

		get label() {
			return label();
		},

		set label($$value) {
			label($$value);
			flushSync();
		},

		get tooltip() {
			return tooltip();
		},

		set tooltip($$value) {
			tooltip($$value);
			flushSync();
		},

		get active() {
			return active();
		},

		set active($$value) {
			active($$value);
			flushSync();
		},

		get isLegacy() {
			return isLegacy();
		},

		set isLegacy($$value) {
			isLegacy($$value);
			flushSync();
		},

		get onclick() {
			return onclick();
		},

		set onclick($$value) {
			onclick($$value);
			flushSync();
		}
	};

	var fragment = root();
	var button = first_child(fragment);
	let classes;
	let styles;
	var node = child(button);

	Dom_chef(node, {
		get as() {
			return icon();
		}
	});

	var text = sibling(node);

	reset(button);

	var node_1 = sibling(button, 2);

	Tooltip(node_1, {
		get id() {
			return `${id() ?? ''}-tooltip`;
		},

		get htmlFor() {
			return id();
		},

		get label() {
			return tooltip();
		}
	});

	template_effect(() => {
		set_attribute(button, 'id', id());
		set_value(button, value());
		set_attribute(button, 'type', isLegacy() ? 'submit' : 'button');
		set_attribute(button, 'data-disable-with', isLegacy() ? '' : undefined);
		classes = set_class(button, 1, 'btn btn-sm flex-1 BtnGroup-item svelte-3dffmc', null, classes, { selected: active() });
		set_attribute(button, 'aria-labelledby', `${id() ?? ''}-tooltip`);
		set_attribute(button, 'tabindex', active() ? -1 : undefined);
		styles = set_style(button, '', styles, { 'pointer-events': active() ? 'none' : undefined });
		set_text(text, ` ${label() ?? ''}`);
	});

	delegated('click', button, function (...$$args) {
		onclick()?.apply(this, $$args);
	});

	append($$anchor, fragment);

	return pop($$exports);
}

delegate(['click']);

create_custom_element(
	Status_subscription_button,
	{
		id: {},
		value: {},
		icon: {},
		label: {},
		tooltip: {},
		active: {},
		isLegacy: {},
		onclick: {}
	},
	[],
	[],
	{ mode: 'open' }
);

export { Status_subscription_button as default };
