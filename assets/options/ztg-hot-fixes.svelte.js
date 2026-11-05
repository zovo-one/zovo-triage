import '../npm/ztg-svelte-internal-disclose-version.js';
import { get } from '../npm/ztg-svelte-internal-client-runtime.js';
import { push, pop } from '../npm/ztg-svelte-internal-client-context.js';
import { flushSync } from '../npm/ztg-svelte-internal-client-reactivity-batch.js';
import { reset } from '../npm/ztg-svelte-internal-client-dom-hydration.js';
import { sibling, first_child, child } from '../npm/ztg-svelte-internal-client-dom-operations.js';
import { template_effect } from '../npm/ztg-svelte-internal-client-reactivity-effects.js';
import { delegate, delegated } from '../npm/ztg-svelte-internal-client-dom-elements-events.js';
import { from_html, append, comment } from '../npm/ztg-svelte-internal-client-dom-template.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { state, set } from '../npm/ztg-svelte-internal-client-reactivity-sources.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import { user_derived } from '../npm/ztg-svelte-internal-client-reactivity-deriveds.js';
import { await_block } from '../npm/ztg-svelte-internal-client-dom-blocks-await.js';
import { if_block } from '../npm/ztg-svelte-internal-client-dom-blocks-if.js';
import { remove_textarea_child } from '../npm/ztg-svelte-internal-client-dom-elements-misc.js';
import { set_value, set_attribute } from '../npm/ztg-svelte-internal-client-dom-elements-attributes.js';
import { proxy } from '../npm/ztg-svelte-internal-client-proxy.js';
import { prop } from '../npm/ztg-svelte-internal-client-reactivity-props.js';
import { create_custom_element } from '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import { styleHotfixes, brokenFeatures } from '../helpers/ztg-hotfix.js';
import isDevelopmentVersion from '../helpers/ztg-is-development-version.js';

var root = from_html(`<p>Hotfixes are not applied in the development version.</p>`);
var root_1 = from_html(`<p>Hotfixes are not applied to GitHub Enterprise.</p>`);
var root_2 = from_html(`<textarea readonly="" class="text-monospace text-code"></textarea>`);
var root_3 = from_html(`<textarea readonly="" class="text-italics">No hotfixes needed for this version! 🎉</textarea>`);
var root_4 = from_html(`<textarea readonly="" class="text-monospace"></textarea>`);
var root_5 = from_html(`<textarea readonly="" class="text-italics">No broken features found in cache. This may be indicative of a hotfix loading failure, the list is never empty if you've ever opened github.com</textarea>`);

var root_6 = from_html(
	`<p><button type="button">Update hotfixes</button> <button type="button">Empty hotfixes</button></p> <p class="error-banner">✅ Hotfixes have been emptied and will stay empty until the next
		auto-update in a few hours.</p> <h3>CSS hotfixes</h3> <p><!></p> <h3>Disabled features</h3> <p><!></p>`,
	1
);

var root_7 = from_html(
	`<p>In order to address severe issues as quickly as possible, Refined GitHub
	loads a list of disabled features and temporary CSS fixes. <a href="https://github.com/refined-github/yolo">More info.</a></p> <!>`,
	1
);

function Hot_fixes($$anchor, $$props) {
	push($$props, true);

	const enterprise = prop($$props, 'enterprise', 7, false);
	const { version } = chrome.runtime.getManifest();
	let emptied = state(false);

	// This will attempt to load the hotfixes because we do want an up-to-date options page
	let hotfixesPromise = state(proxy(styleHotfixes.get(version)));

	let brokenFeaturesPromise = state(proxy(brokenFeatures.get()));

	function refreshHotfixes() {
		set(emptied, false);
		set(hotfixesPromise, styleHotfixes.getFresh(version), true);
		set(brokenFeaturesPromise, brokenFeatures.getFresh(), true);
	}

	function emptyHotfixes() {
		set(hotfixesPromise, styleHotfixes.setCached('', version), true);
		set(brokenFeaturesPromise, brokenFeatures.setCached([]), true);
		set(emptied, true);
	}

	var $$exports = {
		get enterprise() {
			return enterprise();
		},

		set enterprise($$value = false) {
			enterprise($$value);
			flushSync();
		}
	};

	var fragment = root_7();
	var node = sibling(first_child(fragment), 2);

	{
		var consequent = ($$anchor) => {
			var p = root();

			append($$anchor, p);
		};

		var d = user_derived(() => isDevelopmentVersion());

		var consequent_1 = ($$anchor) => {
			var p_1 = root_1();

			append($$anchor, p_1);
		};

		var alternate_2 = ($$anchor) => {
			var fragment_1 = root_6();
			var p_2 = first_child(fragment_1);
			var button = child(p_2);
			var button_1 = sibling(button, 2);

			reset(p_2);

			var p_3 = sibling(p_2, 2);
			var p_4 = sibling(p_3, 4);
			var node_1 = child(p_4);

			await_block(node_1, () => get(hotfixesPromise), null, ($$anchor, hotfixes) => {
				var fragment_2 = comment();
				var node_2 = first_child(fragment_2);

				{
					var consequent_2 = ($$anchor) => {
						var textarea = root_2();

						remove_textarea_child(textarea);
						template_effect(() => set_value(textarea, get(hotfixes)));
						append($$anchor, textarea);
					};

					var alternate = ($$anchor) => {
						var textarea_1 = root_3();

						append($$anchor, textarea_1);
					};

					if_block(node_2, ($$render) => {
						if (get(hotfixes)) $$render(consequent_2); else $$render(alternate, -1);
					});
				}

				append($$anchor, fragment_2);
			});

			reset(p_4);

			var p_5 = sibling(p_4, 4);
			var node_3 = child(p_5);

			await_block(node_3, () => get(brokenFeaturesPromise), null, ($$anchor, features) => {
				var fragment_3 = comment();
				var node_4 = first_child(fragment_3);

				{
					var consequent_3 = ($$anchor) => {
						var textarea_2 = root_4();

						remove_textarea_child(textarea_2);

						template_effect(($0) => set_value(textarea_2, $0), [
							() => get(features).map((line) => line.join(' ')).join('\n')
						]);

						append($$anchor, textarea_2);
					};

					var alternate_1 = ($$anchor) => {
						var textarea_3 = root_5();

						append($$anchor, textarea_3);
					};

					if_block(node_4, ($$render) => {
						if (get(features).length) $$render(consequent_3); else $$render(alternate_1, -1);
					});
				}

				append($$anchor, fragment_3);
			});

			reset(p_5);
			template_effect(() => set_attribute(p_3, 'hidden', !get(emptied)));
			delegated('click', button, refreshHotfixes);
			delegated('click', button_1, emptyHotfixes);
			append($$anchor, fragment_1);
		};

		if_block(node, ($$render) => {
			if (get(d)) $$render(consequent); else if (enterprise()) $$render(consequent_1, 1); else $$render(alternate_2, -1);
		});
	}

	append($$anchor, fragment);

	return pop($$exports);
}

delegate(['click']);
create_custom_element(Hot_fixes, { enterprise: {} }, [], [], { mode: 'open' });

export { Hot_fixes as default };
