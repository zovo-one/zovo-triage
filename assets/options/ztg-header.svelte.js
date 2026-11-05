import '../npm/ztg-svelte-internal-disclose-version.js';
import { template_effect } from '../npm/ztg-svelte-internal-client-reactivity-effects.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { pop, push } from '../npm/ztg-svelte-internal-client-context.js';
import { flushSync } from '../npm/ztg-svelte-internal-client-reactivity-batch.js';
import { reset } from '../npm/ztg-svelte-internal-client-dom-hydration.js';
import { child, sibling } from '../npm/ztg-svelte-internal-client-dom-operations.js';
import { set_text } from '../npm/ztg-svelte-internal-client-render.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import { from_html, append } from '../npm/ztg-svelte-internal-client-dom-template.js';
import { if_block } from '../npm/ztg-svelte-internal-client-dom-blocks-if.js';
import { slot } from '../npm/ztg-svelte-internal-client-dom-blocks-slot.js';
import { append_styles } from '../npm/ztg-svelte-internal-client-dom-css.js';
import { prop } from '../npm/ztg-svelte-internal-client-reactivity-props.js';
import { create_custom_element } from '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';

var root = from_html(`<small class="svelte-e044ec"> </small>`);
var root_1 = from_html(`<header class="svelte-e044ec"><div class="content svelte-e044ec"><h1 class="svelte-e044ec"><img src="triage-icon-32.png" alt="" height="32" class="svelte-e044ec"/> <!></h1> <div><!></div></div></header>`);

const $$css = {
	hash: 'svelte-e044ec',
	code: 'header.svelte-e044ec {background-color:var(--ztg-card);border-bottom:solid 1px var(--ztg-border);padding-block:24px;padding-inline:var(--viewport-margin);display:grid;gap:1em;& > :where(.svelte-e044ec) {width:100%;max-width:var(--content-width);margin:auto;}}h1.svelte-e044ec {font-size:clamp(1.3em, 5vw, 1.7em);font-weight:750;letter-spacing:-0.02em;img:where(.svelte-e044ec) {height:1.3em;width:1.3em;vertical-align:top;}small:where(.svelte-e044ec) {font-size:0.7em;opacity:0.9;}}header.svelte-e044ec p {max-width:620px;margin:8px 0 0;color:var(--ztg-muted);font-size:14px;line-height:1.6;}'
};

function Header($$anchor, $$props) {
	push($$props, true);
	append_styles($$anchor, $$css);

	const title = prop($$props, 'title', 7),
		withVersion = prop($$props, 'withVersion', 7, false);

	const { version } = chrome.runtime.getManifest();

	var $$exports = {
		get title() {
			return title();
		},

		set title($$value) {
			title($$value);
			flushSync();
		},

		get withVersion() {
			return withVersion();
		},

		set withVersion($$value = false) {
			withVersion($$value);
			flushSync();
		}
	};

	var header = root_1();
	var div = child(header);
	var h1 = child(div);
	var text = sibling(child(h1));
	var node = sibling(text);

	{
		var consequent = ($$anchor) => {
			var small = root();
			var text_1 = child(small);

			reset(small);
			template_effect(() => set_text(text_1, `v${version ?? ''}`));
			append($$anchor, small);
		};

		if_block(node, ($$render) => {
			if (withVersion()) $$render(consequent);
		});
	}

	reset(h1);

	var div_1 = sibling(h1, 2);
	var node_1 = child(div_1);

	slot(node_1, $$props, 'default', {});
	reset(div_1);
	reset(div);
	reset(header);
	template_effect(() => set_text(text, ` ${title() ?? ''} `));
	append($$anchor, header);

	return pop($$exports);
}

create_custom_element(Header, { title: {}, withVersion: {} }, ['default'], [], { mode: 'open' });

export { Header as default };
