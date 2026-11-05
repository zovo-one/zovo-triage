import '../npm/ztg-svelte-internal-disclose-version.js';
import { template_effect } from '../npm/ztg-svelte-internal-client-reactivity-effects.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { push, pop } from '../npm/ztg-svelte-internal-client-context.js';
import { flushSync } from '../npm/ztg-svelte-internal-client-reactivity-batch.js';
import { reset } from '../npm/ztg-svelte-internal-client-dom-hydration.js';
import { child, sibling, first_child } from '../npm/ztg-svelte-internal-client-dom-operations.js';
import { set_text } from '../npm/ztg-svelte-internal-client-render.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import { from_html, append } from '../npm/ztg-svelte-internal-client-dom-template.js';
import { if_block } from '../npm/ztg-svelte-internal-client-dom-blocks-if.js';
import { each } from '../npm/ztg-svelte-internal-client-dom-blocks-each.js';
import { append_styles } from '../npm/ztg-svelte-internal-client-dom-css.js';
import { action } from '../npm/ztg-svelte-internal-client-dom-elements-actions.js';
import { set_custom_element_data } from '../npm/ztg-svelte-internal-client-dom-elements-attributes.js';
import { set_class } from '../npm/ztg-svelte-internal-client-dom-elements-class.js';
import { prop } from '../npm/ztg-svelte-internal-client-reactivity-props.js';
import { create_custom_element } from '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import { lastElement } from '../npm/ztg-select-dom.js';
import { upperCaseFirst } from '../github-helpers/ztg-index.js';
import portal from '../helpers/ztg-portal.js';

var root = from_html(`<span data-kbd-chord="true" class="svelte-blthtm"> </span> `, 1);
var root_1 = from_html(`<kbd class="rgh-shortcut svelte-blthtm"></kbd>`);
var root_2 = from_html(`<tool-tip> <!></tool-tip>`, 2);

const $$css = {
	hash: 'svelte-blthtm',
	code: '\n	/* Copied from: https://github.com/primer/react/blob/dfed7ca73532922ec0526dd85afcf7ae471c566e/packages/react/src/KeybindingHint/KeybindingHint.module.css */.rgh-shortcut.svelte-blthtm {position:relative;padding:0;margin-left:var(--base-size-6, 0.375rem);overflow:visible;font-family:inherit;font-size:inherit;line-height:unset;color:inherit;white-space:nowrap;vertical-align:baseline;background:none;border:none;box-shadow:none;}\n\n	/* Adapted from: https://github.com/primer/react/blob/dfed7ca73532922ec0526dd85afcf7ae471c566e/packages/react/src/KeybindingHint/components/Chord.module.css */.rgh-shortcut.svelte-blthtm span:where(.svelte-blthtm) {display:inline-flex;border:var(--borderWidth-thin, 0.0625rem) solid;border-radius:var(--borderRadius-small, 0.1875rem);border-color:#0000;font-weight:var(--base-text-weight-normal, 400);font-size:11px;gap:0.5ch;box-shadow:none;vertical-align:baseline;overflow:hidden;justify-content:center;padding:var(--base-size-2, 0.125rem);line-height:var(--base-size-8, 0.5rem);min-width:var(--base-size-16, 1rem);color:var(--fgColor-onEmphasis, fuchsia);background:var(--counter-bgColor-emphasis, fuchsia);}'
};

function Tooltip($$anchor, $$props) {
	push($$props, true);
	append_styles($$anchor, $$css);

	const id = prop($$props, 'id', 7),
		htmlFor = prop($$props, 'htmlFor', 7),
		label = prop($$props, 'label', 7),
		shortcut = prop($$props, 'shortcut', 7),
		direction = prop($$props, 'direction', 7, 's'),
		type = prop($$props, 'type', 7, 'label');

	function getTarget() {
		// Align tooltip behavior with native
		// https://github.com/refined-github/refined-github/pull/9668
		return lastElement([
			'#js-repo-pjax-container',
			'#js-pjax-container',
			'#repo-content-turbo-frame',
			'#repo-content-pjax-container',
			'[data-turbo-body]' // User profile
		]);
	}

	var $$exports = {
		get id() {
			return id();
		},

		set id($$value) {
			id($$value);
			flushSync();
		},

		get htmlFor() {
			return htmlFor();
		},

		set htmlFor($$value) {
			htmlFor($$value);
			flushSync();
		},

		get label() {
			return label();
		},

		set label($$value) {
			label($$value);
			flushSync();
		},

		get shortcut() {
			return shortcut();
		},

		set shortcut($$value) {
			shortcut($$value);
			flushSync();
		},

		get direction() {
			return direction();
		},

		set direction($$value = 's') {
			direction($$value);
			flushSync();
		},

		get type() {
			return type();
		},

		set type($$value = 'label') {
			type($$value);
			flushSync();
		}
	};

	var tool_tip = root_2();

	template_effect(() => set_custom_element_data(tool_tip, 'id', id()));
	template_effect(() => set_custom_element_data(tool_tip, 'for', htmlFor()));
	set_class(tool_tip, 1, 'sr-only position-absolute');
	set_custom_element_data(tool_tip, 'popover', 'manual');
	template_effect(() => set_custom_element_data(tool_tip, 'data-direction', direction()));
	template_effect(() => set_custom_element_data(tool_tip, 'data-type', type()));
	set_custom_element_data(tool_tip, 'aria-hidden', 'true');
	set_custom_element_data(tool_tip, 'role', 'tooltip');

	var text = child(tool_tip);
	var node = sibling(text);

	{
		var consequent = ($$anchor) => {
			var kbd = root_1();

			each(kbd, 20, () => shortcut().split(' '), (key) => key, ($$anchor, key) => {
				var fragment = root();
				var span = first_child(fragment);
				var text_1 = child(span, true);

				reset(span);

				var text_2 = sibling(span);

				text_2.nodeValue = '  ';
				template_effect(($0) => set_text(text_1, $0), [() => upperCaseFirst(key)]);
				append($$anchor, fragment);
			});

			reset(kbd);
			append($$anchor, kbd);
		};

		if_block(node, ($$render) => {
			if (shortcut()) $$render(consequent);
		});
	}

	reset(tool_tip);
	action(tool_tip, ($$node, $$action_arg) => portal?.($$node, $$action_arg), () => getTarget);
	template_effect(() => set_text(text, `${label() ?? ''} `));
	append($$anchor, tool_tip);

	return pop($$exports);
}

create_custom_element(
	Tooltip,
	{
		id: {},
		htmlFor: {},
		label: {},
		shortcut: {},
		direction: {},
		type: {}
	},
	[],
	[],
	{ mode: 'open' }
);

export { Tooltip as default };
