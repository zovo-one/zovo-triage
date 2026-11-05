import './npm/ztg-svelte-internal-disclose-version.js';
import { onMount } from './npm/ztg-svelte-index-client.js';
import { user_effect, template_effect } from './npm/ztg-svelte-internal-client-reactivity-effects.js';
import { push, pop } from './npm/ztg-svelte-internal-client-context.js';
import './npm/ztg-svelte-internal-client-constants.js';
import { get } from './npm/ztg-svelte-internal-client-runtime.js';
import { next, reset } from './npm/ztg-svelte-internal-client-dom-hydration.js';
import { state, set } from './npm/ztg-svelte-internal-client-reactivity-sources.js';
import { set_text } from './npm/ztg-svelte-internal-client-render.js';
import { child, sibling } from './npm/ztg-svelte-internal-client-dom-operations.js';
import { from_html, append, text } from './npm/ztg-svelte-internal-client-dom-template.js';
import { if_block } from './npm/ztg-svelte-internal-client-dom-blocks-if.js';
import './npm/ztg-svelte-internal-client-dom-reconciler.js';
import { append_styles } from './npm/ztg-svelte-internal-client-dom-css.js';
import { remove_input_defaults } from './npm/ztg-svelte-internal-client-dom-elements-attributes.js';
import { set_class } from './npm/ztg-svelte-internal-client-dom-elements-class.js';
import { delegate, delegated } from './npm/ztg-svelte-internal-client-dom-elements-events.js';
import { bind_value } from './npm/ztg-svelte-internal-client-dom-elements-bindings-input.js';
import { create_custom_element } from './npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import './npm/ztg-webext-bugs-target-blank.js';
import { hasValidGitHubComToken } from './github-helpers/ztg-github-token.js';
import optionsStorage from './ztg-options-storage.js';
import Header from './options/ztg-header.svelte.js';

var root = from_html(`<button class="svelte-ghkk3m">Grant</button>`);
var root_1 = from_html(`<span class="error svelte-ghkk3m"> </span>`);
var root_2 = from_html(`<main><!> <div class="content svelte-ghkk3m"><ul class="svelte-ghkk3m"><li><!> the extension access to github.com</li>  <li><a href="https://github.com/settings/tokens/new?description=Refined%20GitHub&amp;scopes=repo,read:project,workflow&amp;default_expires_at=none" class="svelte-ghkk3m">Generate a token</a> to ensure that every feature works correctly. <a href="https://github.com/refined-github/refined-github/wiki/Security" class="svelte-ghkk3m">More info</a></li> <li><label for="token-input" class="svelte-ghkk3m">Paste token:</label> <input id="token-input" type="text" size="10" autocomplete="off" name="personalToken" class="svelte-ghkk3m"/> <!></li></ul></div> <footer class="svelte-ghkk3m"><h2>Setup complete, redirecting to <a class="hidden-link svelte-ghkk3m" href="https://github.com/refined-github/refined-github/wiki" target="_self">GitHub</a>…</h2></footer></main>`);

const $$css = {
	hash: 'svelte-ghkk3m',
	code: ':host {font-size:2em;display:grid;--content-width: 60rem;--viewport-margin: 30px;}:host .svelte-ghkk3m {box-sizing:border-box;}main.svelte-ghkk3m {transition:opacity 1s;margin-bottom:2em;}footer.svelte-ghkk3m {margin-top:50px;}h2.svelte-ghkk3m {font-size:clamp(1.2em, 4vw, 1.5em);padding-inline:var(--viewport-margin);max-width:var(--content-width);font-weight:200;margin:auto;}.content.svelte-ghkk3m {padding-inline:var(--viewport-margin);}ul.svelte-ghkk3m {list-style:none;margin:30px auto;max-width:var(--content-width);padding:var(--viewport-margin) 0;}a.svelte-ghkk3m,\n	button.svelte-ghkk3m {all:initial;font:inherit;text-decoration:underline;color:cornflowerblue;cursor:pointer;}.hidden-link.svelte-ghkk3m {color:inherit;}li.svelte-ghkk3m {margin-block:1em;padding-left:1.8em;}input.svelte-ghkk3m {background:light-dark(#f6f8fa, #151b23);border:solid 1px light-dark(#d0d9e0, #3d444d);border-radius:6px;padding:5px 12px;font-size:inherit;line-height:20px;margin-left:0.5em;}input.svelte-ghkk3m:focus {background:light-dark(#fff, #0d1117);border-color:#1f6feb;box-shadow:inset 0 0 0 1px #1f6feb;outline:none;}li.svelte-ghkk3m::before {content:\'\';display:inline-block;width:1em;height:1em;vertical-align:-0.2em;margin-right:0.8em;margin-left:-1.8em; /* Pull out */background-image:url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill-rule="evenodd" fill="gray" d="M8 5.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM4 8a4 4 0 118 0 4 4 0 01-8 0z"></path></svg>\');background-size:contain;}li.valid.svelte-ghkk3m::before {background-image:url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill-rule="evenodd" fill="%2328a745" d="M8 16A8 8 0 108 0a8 8 0 000 16zm3.78-9.72a.75.75 0 00-1.06-1.06L6.75 9.19 5.28 7.72a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0l4.5-4.5z"></path></svg>\');}.will-show.svelte-ghkk3m {\n		animation: svelte-ghkk3m-fade-in 0.5s;animation-play-state:paused;}.will-show.visible.svelte-ghkk3m {animation-play-state:running;}.dimmed.svelte-ghkk3m {opacity:40%;}.error.svelte-ghkk3m {color:#cf222e;font-size:0.8em;}\n\n	@keyframes svelte-ghkk3m-fade-in {\n		from {\n			opacity: 0%;\n		}\n	}'
};

function Welcome($$anchor, $$props) {
	push($$props, true);
	append_styles($$anchor, $$css);

	// eslint-disable-next-line import-x/no-unassigned-import -- Side effects
	let stepVisible = state(1);

	let stepValid = state(0);
	let tokenInput = state('');
	let tokenError = state('');

	user_effect(() => {
		if (get(stepValid) === 1) {
			setTimeout(showThirdStep, 2000);
		} else if (get(stepValid) === 3) {
			setTimeout(
				() => {
					location.replace('https://github.com/refined-github/refined-github/wiki');
				},
				2000
			);
		}
	});

	user_effect(() => {
		if (!get(tokenInput)) {
			return;
		}

		verifyToken();

		// @ts-expect-error TS and its index signatures...
		optionsStorage.set({ personalToken: get(tokenInput) });
	});

	const origins = ['https://github.com/*', 'https://gist.github.com/*'];

	async function grantPermissions() {
		const granted = await chrome.permissions.request({ origins });

		if (granted) {
			set(stepVisible, 2);
			set(stepValid, 1);
		}
	}

	function showThirdStep() {
		set(stepVisible, 3);
	}

	function markSecondStep() {
		setTimeout(
			() => {
				set(stepValid, 2);
				set(stepVisible, 3);
			},
			1000
		);
	}

	async function verifyToken() {
		if (await hasValidGitHubComToken(get(tokenInput))) {
			set(stepValid, 3);
			set(tokenError, '');
		} else {
			set(tokenError, 'Invalid token');
		}
	}

	onMount(async () => {
		if (!await chrome.permissions.contains({ origins })) {
			return;
		}

		set(stepValid, 1);

		setTimeout(
			() => {
				set(stepVisible, 2);
			},
			500
		);
	});

	var main = root_2();
	let classes;
	var node = child(main);

	Header(node, { title: 'Welcome to Zovo Triage' });

	var div = sibling(node, 2);
	var ul = child(div);
	var li = child(ul);
	let classes_1;
	var node_1 = child(li);

	{
		var consequent = ($$anchor) => {
			var button = root();

			delegated('click', button, grantPermissions);
			append($$anchor, button);
		};

		var alternate = ($$anchor) => {
			var text$1 = text('Grant');

			append($$anchor, text$1);
		};

		if_block(node_1, ($$render) => {
			if (get(stepValid) === 0) $$render(consequent); else $$render(alternate, -1);
		});
	}

	next();
	reset(li);

	var li_1 = sibling(li, 2);
	let classes_2;
	var a = child(li_1);

	next(2);
	reset(li_1);

	var li_2 = sibling(li_1, 2);
	let classes_3;
	var input = sibling(child(li_2), 2);

	remove_input_defaults(input);

	var node_2 = sibling(input, 2);

	{
		var consequent_1 = ($$anchor) => {
			var span = root_1();
			var text_1 = child(span, true);

			reset(span);
			template_effect(() => set_text(text_1, get(tokenError)));
			append($$anchor, span);
		};

		if_block(node_2, ($$render) => {
			if (get(tokenError)) $$render(consequent_1);
		});
	}

	reset(li_2);
	reset(ul);
	reset(div);

	var footer = sibling(div, 2);
	var h2 = child(footer);
	let classes_4;

	reset(footer);
	reset(main);

	template_effect(() => {
		classes = set_class(main, 1, 'svelte-ghkk3m', null, classes, { dimmed: get(stepValid) === 3 });

		classes_1 = set_class(li, 1, 'will-show svelte-ghkk3m', null, classes_1, {
			valid: get(stepValid) >= 1,
			visible: get(stepVisible) >= 1
		});

		classes_2 = set_class(li_1, 1, 'will-show svelte-ghkk3m', null, classes_2, {
			valid: get(stepValid) >= 2,
			visible: get(stepVisible) >= 2
		});

		classes_3 = set_class(li_2, 1, 'will-show svelte-ghkk3m', null, classes_3, {
			valid: get(stepValid) >= 3,
			visible: get(stepVisible) >= 3
		});

		classes_4 = set_class(h2, 1, 'will-show svelte-ghkk3m', null, classes_4, { visible: get(stepValid) === 3 });
	});

	delegated('click', li_1, showThirdStep);
	delegated('click', a, markSecondStep);
	bind_value(input, () => get(tokenInput), ($$value) => set(tokenInput, $$value));
	append($$anchor, main);
	pop();
}

delegate(['click']);
customElements.define('rgh-welcome', create_custom_element(Welcome, {}, [], [], { mode: 'open' }));

export { Welcome as default };
