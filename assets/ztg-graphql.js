import './npm/ztg-svelte-internal-disclose-version.js';
import { get } from './npm/ztg-svelte-internal-client-runtime.js';
import { pop, push } from './npm/ztg-svelte-internal-client-context.js';
import './npm/ztg-svelte-internal-client-constants.js';
import { child, sibling } from './npm/ztg-svelte-internal-client-dom-operations.js';
import { state, set } from './npm/ztg-svelte-internal-client-reactivity-sources.js';
import { template_effect } from './npm/ztg-svelte-internal-client-reactivity-effects.js';
import { remove_textarea_child } from './npm/ztg-svelte-internal-client-dom-elements-misc.js';
import { reset } from './npm/ztg-svelte-internal-client-dom-hydration.js';
import { set_text } from './npm/ztg-svelte-internal-client-render.js';
import './npm/ztg-svelte-internal-client-dom-reconciler.js';
import { from_html, append } from './npm/ztg-svelte-internal-client-dom-template.js';
import { if_block } from './npm/ztg-svelte-internal-client-dom-blocks-if.js';
import { append_styles } from './npm/ztg-svelte-internal-client-dom-css.js';
import { set_value } from './npm/ztg-svelte-internal-client-dom-elements-attributes.js';
import { event } from './npm/ztg-svelte-internal-client-dom-elements-events.js';
import { bind_value } from './npm/ztg-svelte-internal-client-dom-elements-bindings-input.js';
import { proxy } from './npm/ztg-svelte-internal-client-proxy.js';
import { create_custom_element } from './npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import api from './github-helpers/ztg-api.js';
import Header from './options/ztg-header.svelte.js';

var root = from_html(`<p class="error svelte-19beirj" role="alert"> </p>`);
var root_1 = from_html(`<main class="svelte-19beirj"><!> <form class="svelte-19beirj"><label for="query" class="svelte-19beirj">Query</label> <textarea id="query" spellcheck="false" autocomplete="off" autocapitalize="off" class="svelte-19beirj"></textarea> <label for="variables" class="svelte-19beirj">Variables (JSON, optional)</label> <textarea id="variables" spellcheck="false" autocomplete="off" autocapitalize="off" class="svelte-19beirj"></textarea> <button class="svelte-19beirj"> </button> <label for="response" class="svelte-19beirj">Response</label> <textarea id="response" readonly="" spellcheck="false" class="svelte-19beirj"></textarea> <!></form></main>`);

const $$css = {
	hash: 'svelte-19beirj',
	code: ':host {font-size:2em;display:block;}main.svelte-19beirj {--content-width: 60rem;--viewport-margin: 30px;}form.svelte-19beirj {display:grid;gap:1em;padding-inline:var(--viewport-margin);padding-block:1.5rem;max-width:var(--content-width);margin:auto;}label.svelte-19beirj {font-weight:600;}textarea.svelte-19beirj {field-sizing:content;min-height:3em;font-family:ui-monospace,\n			SFMono-Regular,\n			Menlo,\n			Monaco,\n			Consolas,\n			monospace;background:light-dark(#f6f8fa, #151b23);border:solid 1px light-dark(#d0d9e0, #3d444d);border-radius:6px;padding:10px 12px;font-size:0.8em;line-height:1.4;}textarea.svelte-19beirj:focus {background:light-dark(#fff, #0d1117);border-color:#1f6feb;box-shadow:inset 0 0 0 1px #1f6feb;outline:none;}button.svelte-19beirj {justify-self:start;font-size:0.9em;padding:0.45em 0.9em;}.error.svelte-19beirj {color:#cf222e;margin:0;}'
};

function Graphql($$anchor, $$props) {
	push($$props, true);
	append_styles($$anchor, $$css);

	let query = state(`viewer {
	login
}`);

	let variablesJson = state(proxy(JSON.stringify({ owner: 'refined-github', name: 'refined-github' }, undefined, '\t')));
	let responseJson = state('');
	let error = state('');
	let loading = state(false);

	async function runQuery(event) {
		event.preventDefault();
		set(error, '');
		set(responseJson, '');
		set(loading, true);

		try {
			const variables = parseVariables();
			const data = await api.v4uncached(get(query), { variables });

			set(responseJson, JSON.stringify(data, undefined, 2), true);
		} catch(caughtError) {
			set(error, caughtError instanceof Error ? caughtError.message : String(caughtError), true);
		} finally {
			set(loading, false);
		}
	}

	function parseVariables() {
		const trimmed = get(variablesJson).trim();

		if (!trimmed) {
			return undefined;
		}

		const parsed = JSON.parse(trimmed);

		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
			throw new TypeError('Variables must be a JSON object.');
		}

		return parsed;
	}

	var main = root_1();
	var node = child(main);

	Header(node, { title: 'GraphQL tester' });

	var form = sibling(node, 2);
	var textarea = sibling(child(form), 2);

	remove_textarea_child(textarea);

	var textarea_1 = sibling(textarea, 4);

	remove_textarea_child(textarea_1);

	var button = sibling(textarea_1, 2);
	var text = child(button, true);

	reset(button);

	var textarea_2 = sibling(button, 4);

	remove_textarea_child(textarea_2);

	var node_1 = sibling(textarea_2, 2);

	{
		var consequent = ($$anchor) => {
			var p = root();
			var text_1 = child(p, true);

			reset(p);
			template_effect(() => set_text(text_1, get(error)));
			append($$anchor, p);
		};

		if_block(node_1, ($$render) => {
			if (get(error)) $$render(consequent);
		});
	}

	reset(form);
	reset(main);

	template_effect(() => {
		button.disabled = get(loading);
		set_text(text, get(loading) ? 'Running…' : 'Run query');
		set_value(textarea_2, get(responseJson));
	});

	event('submit', form, runQuery);
	bind_value(textarea, () => get(query), ($$value) => set(query, $$value));
	bind_value(textarea_1, () => get(variablesJson), ($$value) => set(variablesJson, $$value));
	append($$anchor, main);
	pop();
}

customElements.define('rgh-graphql', create_custom_element(Graphql, {}, [], [], { mode: 'open' }));

export { Graphql as default };
