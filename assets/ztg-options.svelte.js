import './npm/ztg-svelte-internal-disclose-version.js';
import { get } from './npm/ztg-svelte-internal-client-runtime.js';
import { push, pop } from './npm/ztg-svelte-internal-client-context.js';
import { flushSync } from './npm/ztg-svelte-internal-client-reactivity-batch.js';
import { next, reset } from './npm/ztg-svelte-internal-client-dom-hydration.js';
import { first_child, sibling, child } from './npm/ztg-svelte-internal-client-dom-operations.js';
import { template_effect } from './npm/ztg-svelte-internal-client-reactivity-effects.js';
import './npm/ztg-svelte-internal-client-constants.js';
import { from_html, append } from './npm/ztg-svelte-internal-client-dom-template.js';
import { user_derived } from './npm/ztg-svelte-internal-client-reactivity-deriveds.js';
import './npm/ztg-svelte-internal-client-dom-reconciler.js';
import { set_attribute } from './npm/ztg-svelte-internal-client-dom-elements-attributes.js';
import { prop } from './npm/ztg-svelte-internal-client-reactivity-props.js';
import { create_custom_element } from './npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import Background_status from './options/ztg-background-status.svelte.js';
import Feature_count from './options/ztg-feature-count.svelte.js';
import Feature_finder from './options/ztg-feature-finder.svelte.js';
import Feature_list from './options/ztg-feature-list.svelte.js';
import Handle_expand from './options/ztg-handle-expand.svelte.js';
import Header from './options/ztg-header.svelte.js';
import Hot_fixes from './options/ztg-hot-fixes.svelte.js';
import Storage_usage from './options/ztg-storage-usage.svelte.js';
import Token_input from './options/ztg-token-input.svelte.js';
import Version_info from './options/ztg-version-info.svelte.js';

var root = from_html(`<p>Configure the proven interface-refinement core behind your maintainer cockpit.
		The notification board, queue shortcuts, saved filters, and diff focus layer
		are ready from the toolbar popup.</p>`);

var root_1 = from_html(`<details id="token"><summary><strong>🔑 Personal token</strong></summary> <p>You should <a id="personal-token-link">generate a token</a> to ensure that every feature works correctly. You can read more about
				the token on <a href="https://github.com/refined-github/refined-github/wiki/Security">the wiki.</a></p> <p><strong>Token-less usage is not officially supported.</strong></p> <!></details>`);

var root_2 = from_html(`<details id="toggle-all" hidden=""><summary><strong>🏳️ Toggle all features</strong></summary> <p>If you're trying to identify a feature, please use "Identify feature"
				instead. Refined GitHub only implements lightweight features that are
				helpful to most people, even if they're tiny improvements. They're meant
				to "blend in" and fill in the gaps of GitHub's interface.</p> <p>If you want to go through and only select a few improvements, you'll
				miss out on the best parts of Refined GitHub. Also note that new
				features will still be enabled by default and that some CSS-only
				refinements cannot be disabled.</p> <p><button id="disable-all-features" type="button">Disable all features</button> <button id="enable-all-features" type="button">Enable all features</button></p></details>`);

var root_3 = from_html(`<details id="features"><summary><strong>🔋 Features<!></strong></summary> <!></details>`);
var root_4 = from_html(`<details id="bisect"><summary><strong>🔎 Identify feature</strong></summary> <!></details>`);

var root_5 = from_html(`<details id="css"><summary><strong>💅 Custom CSS</strong></summary> <p>Like a userstyle, useful to undo unwanted style changes</p> <p><textarea class="monospace-field text-code" name="customCss" rows="2" spellcheck="false"></textarea></p> <p>Options storage: <!></p> <p>When the storage is full, the options <a href="https://github.com/fregante/webext-options-sync/issues/27">will stop being saved</a>. If you need to use a lot of CSS, use a dedicated userstyle
				extension.</p></details>`);

var root_6 = from_html(`<details id="debugging"><summary><strong>🐛 Debugging</strong></summary> <p><label><input type="checkbox" name="logging"/> Show the features enabled on each page in the console</label></p> <p><label><input type="checkbox" name="logHttp"/> Log API calls in the console</label></p> <p>Options storage: <!> <br/> Cache storage: <!> <br/> Core version: <!></p> <p><button id="clear-cache" type="button">Clear cache</button></p> <p><button type="submit" form="welcome-page-link">Open welcome page</button></p> <p><button type="submit" form="graphql-page-link">Open GraphQL tester</button></p> <p><button id="toggle-all-features" type="button">Toggle all features…</button></p></details>`);
var root_7 = from_html(`<details id="hotfixes"><summary><strong>☄️ Hotfixes</strong></summary> <!></details>`);

var root_8 = from_html(`<details id="export"><summary><strong>🗄️ Export options</strong></summary> <p>You can export and import options across browsers and devices via a JSON
				file. If you're a GitHub Enterprise user, you will need to export each
				domain separately.</p> <p><strong>Note</strong> that your options include your access token if
				provided.</p> <p><button type="button" class="js-export">Export</button> <button type="button" class="js-import">Import</button></p></details>`);

var root_9 = from_html(`<!> <form id="options-form" class="detail-view-container"><button type="submit" hidden="">Capture Submit</button> <!> <!> <!> <!> <!> <!> <!> <!> <!></form> <form id="welcome-page-link" action="./welcome.html" method="get" target="_blank"></form> <form id="graphql-page-link" action="./graphql.html" method="get" target="_blank"></form>`, 1);

function Options($$anchor, $$props) {
	push($$props, true);

	const domain = prop($$props, 'domain', 7, 'default');
	const enterprise = user_derived(() => domain() !== 'default');
	const optionsStorageKey = user_derived(() => domain() === 'default' ? 'options' : 'options-' + domain());
	const host = user_derived(() => domain() === 'default' ? 'github.com' : domain());

	var $$exports = {
		get domain() {
			return domain();
		},

		set domain($$value = 'default') {
			domain($$value);
			flushSync();
		}
	};

	var fragment = root_9();
	var node = first_child(fragment);

	Header(node, {
		title: 'Zovo Triage',
		withVersion: true,
		children: ($$anchor, $$slotProps) => {
			var p = root();

			append($$anchor, p);
		},
		$$slots: { default: true }
	});

	var form = sibling(node, 2);
	var node_1 = sibling(child(form), 2);

	Background_status(node_1, {});

	var node_2 = sibling(node_1, 2);

	Handle_expand(node_2, {
		children: ($$anchor, $$slotProps) => {
			var details = root_1();
			var p_1 = sibling(child(details), 2);
			var a = sibling(child(p_1));

			next(2);
			reset(p_1);

			var node_3 = sibling(p_1, 4);

			Token_input(node_3, {
				get host() {
					return get(host);
				}
			});

			reset(details);
			template_effect(() => set_attribute(a, 'href', `https://${get(host)}/settings/tokens/new?description=Zovo%20Triage&scopes=repo,read:project,workflow&default_expires_at=none`));
			append($$anchor, details);
		},
		$$slots: { default: true }
	});

	var node_4 = sibling(node_2, 2);

	Handle_expand(node_4, {
		children: ($$anchor, $$slotProps) => {
			var details_1 = root_2();

			append($$anchor, details_1);
		},
		$$slots: { default: true }
	});

	var node_5 = sibling(node_4, 2);

	Handle_expand(node_5, {
		children: ($$anchor, $$slotProps) => {
			var details_2 = root_3();
			var summary = child(details_2);
			var strong = child(summary);
			var node_6 = sibling(child(strong));

			Feature_count(node_6, {});
			reset(strong);
			reset(summary);

			var node_7 = sibling(summary, 2);

			Feature_list(node_7, {});
			reset(details_2);
			append($$anchor, details_2);
		},
		$$slots: { default: true }
	});

	var node_8 = sibling(node_5, 2);

	Handle_expand(node_8, {
		children: ($$anchor, $$slotProps) => {
			var details_3 = root_4();
			var node_9 = sibling(child(details_3), 2);

			Feature_finder(node_9, {});
			reset(details_3);
			append($$anchor, details_3);
		},
		$$slots: { default: true }
	});

	var node_10 = sibling(node_8, 2);

	Handle_expand(node_10, {
		children: ($$anchor, $$slotProps) => {
			var details_4 = root_5();
			var p_2 = sibling(child(details_4), 6);
			var node_11 = sibling(child(p_2));

			Storage_usage(node_11, {
				area: 'sync',
				get item() {
					return get(optionsStorageKey);
				}
			});

			reset(p_2);
			next(2);
			reset(details_4);
			append($$anchor, details_4);
		},
		$$slots: { default: true }
	});

	var node_12 = sibling(node_10, 2);

	Handle_expand(node_12, {
		children: ($$anchor, $$slotProps) => {
			var details_5 = root_6();
			var p_3 = sibling(child(details_5), 6);
			var node_13 = sibling(child(p_3));

			Storage_usage(node_13, {
				area: 'sync',
				get item() {
					return get(optionsStorageKey);
				}
			});

			var node_14 = sibling(node_13, 4);

			Storage_usage(node_14, { area: 'local' });

			var node_15 = sibling(node_14, 4);

			Version_info(node_15, {});
			reset(p_3);
			next(8);
			reset(details_5);
			append($$anchor, details_5);
		},
		$$slots: { default: true }
	});

	var node_16 = sibling(node_12, 2);

	Handle_expand(node_16, {
		children: ($$anchor, $$slotProps) => {
			var details_6 = root_7();
			var node_17 = sibling(child(details_6), 2);

			Hot_fixes(node_17, {
				get enterprise() {
					return get(enterprise);
				}
			});

			reset(details_6);
			append($$anchor, details_6);
		},
		$$slots: { default: true }
	});

	var node_18 = sibling(node_16, 2);

	Handle_expand(node_18, {
		children: ($$anchor, $$slotProps) => {
			var details_7 = root_8();

			append($$anchor, details_7);
		},
		$$slots: { default: true }
	});

	reset(form);
	next(4);
	append($$anchor, fragment);

	return pop($$exports);
}

customElements.define('rgh-options', create_custom_element(Options, { host: { reflect: true, type: 'String' }, domain: {} }, [], []));
