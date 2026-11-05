import '../npm/ztg-svelte-internal-disclose-version.js';
import { get } from '../npm/ztg-svelte-internal-client-runtime.js';
import { push, pop } from '../npm/ztg-svelte-internal-client-context.js';
import { flushSync } from '../npm/ztg-svelte-internal-client-reactivity-batch.js';
import { reset, next } from '../npm/ztg-svelte-internal-client-dom-hydration.js';
import { set_text } from '../npm/ztg-svelte-internal-client-render.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { user_effect, template_effect } from '../npm/ztg-svelte-internal-client-reactivity-effects.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import { from_html, append } from '../npm/ztg-svelte-internal-client-dom-template.js';
import { first_child, child, sibling } from '../npm/ztg-svelte-internal-client-dom-operations.js';
import { state, set } from '../npm/ztg-svelte-internal-client-reactivity-sources.js';
import { user_derived } from '../npm/ztg-svelte-internal-client-reactivity-deriveds.js';
import { append_styles } from '../npm/ztg-svelte-internal-client-dom-css.js';
import { set_attribute, remove_input_defaults } from '../npm/ztg-svelte-internal-client-dom-elements-attributes.js';
import { event } from '../npm/ztg-svelte-internal-client-dom-elements-events.js';
import { bind_value } from '../npm/ztg-svelte-internal-client-dom-elements-bindings-input.js';
import { proxy } from '../npm/ztg-svelte-internal-client-proxy.js';
import { bind_this } from '../npm/ztg-svelte-internal-client-dom-elements-bindings-this.js';
import { prop } from '../npm/ztg-svelte-internal-client-reactivity-props.js';
import { create_custom_element } from '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import { closestElement } from '../npm/ztg-select-dom.js';
import { SvelteMap } from '../npm/ztg-svelte-reactivity-map.js';
import { getTokenInfo, tokenUser } from '../github-helpers/ztg-github-token.js';
import { assertError } from '../npm/ztg-ts-extras-assert-error.js';

var root = from_html(
	`<p><input name="personalToken" spellcheck="false" autocomplete="off" autocapitalize="off" size="20" class="monospace-field"/> <span class="svelte-4jy7cj"> </span></p> <ul><li class="svelte-4jy7cj">The token enables <a>some features</a> to <strong>read</strong> data from public repositories</li> <li class="svelte-4jy7cj">The <code>public_repo</code> scope lets them <strong>edit</strong> your
		public repositories</li> <li class="svelte-4jy7cj">The <code>repo</code> scope lets them <strong>edit private</strong> repositories as well</li> <li class="svelte-4jy7cj">The <code>read:project</code> scope lets them determine if a repo/org uses
		projects</li> <li class="svelte-4jy7cj">The <code>workflow</code> scope lets them <strong>edit workflow files</strong> <code>.github/workflows/*.yml</code></li></ul>`,
	1
);

const $$css = {
	hash: 'svelte-4jy7cj',
	code: '[data-validation].svelte-4jy7cj {padding-left:1.8em;\n\n		/* Improve wrapping https://github.com/refined-github/refined-github/issues/9153 */display:inline-block;}[data-validation].svelte-4jy7cj::before {content:url(\'data:image/svg+xml; utf8, <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" fill="gray" d="M8 5.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM4 8a4 4 0 118 0 4 4 0 01-8 0z"></path></svg>\');width:16px;height:16px;vertical-align:-4px;margin-right:0.4em;margin-left:-1.8em; /* Pull out */display:inline-block;}[data-validation=\'valid\'].svelte-4jy7cj::before {content:url(\'data:image/svg+xml; utf8, <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" fill="%2328a745" d="M8 16A8 8 0 108 0a8 8 0 000 16zm3.78-9.72a.75.75 0 00-1.06-1.06L6.75 9.19 5.28 7.72a.75.75 0 00-1.06 1.06l2 2a.75.75 0 001.06 0l4.5-4.5z"></path></svg>\');}[data-validation=\'invalid\'].svelte-4jy7cj::before {content:url(\'data:image/svg+xml; utf8, <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" fill="%23cb2431" d="M1.5 8a6.5 6.5 0 0110.535-5.096l-9.131 9.131A6.472 6.472 0 011.5 8zm2.465 5.096a6.5 6.5 0 009.131-9.131l-9.131 9.131zM8 0a8 8 0 100 16A8 8 0 008 0z"></path></svg>\');}'
};

function Token_input($$anchor, $$props) {
	push($$props, true);
	append_styles($$anchor, $$css);

	const host = prop($$props, 'host', 7);
	const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
	const apiFeaturesUrl = 'https://github.com/search?q=repo%3Arefined-github%2Frefined-github+%28api.js+OR+does-file-exist.js+OR+get-default-branch.js+OR+get-pr-info.js+OR+pr-ci-status.js%29+path%3A%2F%5Esource%5C%2Ffeatures%5C%2F%2F&type=code';
	const initialMagicValue = ' '; // Initial non-empty value to avoid validation on first run
	let focused = state(false);
	let tokenField;
	let tokenValue = state(initialMagicValue);
	let validationText = state('');
	let validationError = state(false);
	let scopes = state(proxy(['unknown']));

	const scopeElements = [
		'valid_token',
		'public_repo',
		'repo',
		'read:project',
		'workflow'
	];

	const scopeStates = user_derived(() => {
		const map = new SvelteMap();

		for (const scope of scopeElements) {
			map.set(scope, get(scopes).includes(scope)
				? 'valid'
				: get(scopes).includes('unknown') ? '' : 'invalid');
		}

		return map;
	});

	function getApiUrl() {
		return !host() || host() === 'github.com'
			? 'https://api.github.com/'
			: `https://${host()}/api/v3/`;
	}

	function expandTokenSection() {
		closestElement('details', tokenField).open = true;
	}

	async function validateToken(value) {
		set(validationText, '');
		set(validationError, false);
		set(scopes, ['unknown'], true);

		// Silence first run
		if (value === initialMagicValue) {
			return;
		}

		if (value === '') {
			expandTokenSection();

			return;
		}

		set(validationText, 'Validating…');

		try {
			const base = getApiUrl();
			const [tokenInfo, user] = await Promise.all([getTokenInfo(base, value), tokenUser.get(base, value)]);

			if (tokenInfo.expiration && new Date(tokenInfo.expiration).getTime() < Date.now()) {
				set(validationText, 'Token expired');
				set(validationError, true);
				expandTokenSection();

				return;
			}

			// Build status message with user and expiration
			let statusMessage = `👤 @${user}`;

			if (tokenInfo.expiration) {
				const msUntilExpiration = new Date(tokenInfo.expiration).getTime() - Date.now();
				const daysUntilExpiration = Math.ceil(msUntilExpiration / (1000 * 60 * 60 * 24));

				statusMessage += `, expires ${rtf.format(daysUntilExpiration, 'day')}`;
			} else {
				statusMessage += ', no expiration';
			}

			set(validationText, statusMessage, true);
			set(scopes, tokenInfo.scopes, true);
		} catch(error) {
			assertError(error);
			set(validationText, error.message + ' (expired?)');
			set(validationError, true);
			expandTokenSection();

			throw error;
		}
	}

	user_effect(() => {
		validateToken(get(tokenValue));
	});

	var $$exports = {
		get host() {
			return host();
		},

		set host($$value) {
			host($$value);
			flushSync();
		}
	};

	var fragment = root();
	var p = first_child(fragment);
	var input = child(p);

	remove_input_defaults(input);
	bind_this(input, ($$value) => tokenField = $$value, () => tokenField);

	var span = sibling(input, 2);
	var text = child(span, true);

	reset(span);
	reset(p);

	var ul = sibling(p, 2);
	var li = child(ul);
	var a = sibling(child(li));

	set_attribute(a, 'href', apiFeaturesUrl);
	next(3);
	reset(li);

	var li_1 = sibling(li, 2);
	var li_2 = sibling(li_1, 2);
	var li_3 = sibling(li_2, 2);
	var li_4 = sibling(li_3, 2);

	reset(ul);

	template_effect(
		($0, $1, $2, $3, $4) => {
			set_attribute(input, 'type', get(focused) ? 'text' : 'password');
			set_attribute(span, 'data-validation', get(validationError) ? 'invalid' : undefined);
			set_text(text, get(validationText));
			set_attribute(li, 'data-validation', $0);
			set_attribute(li_1, 'data-validation', $1);
			set_attribute(li_2, 'data-validation', $2);
			set_attribute(li_3, 'data-validation', $3);
			set_attribute(li_4, 'data-validation', $4);
		},
		[
			() => get(scopeStates).get('valid_token'),
			() => get(scopeStates).get('public_repo'),
			() => get(scopeStates).get('repo'),
			() => get(scopeStates).get('read:project'),
			() => get(scopeStates).get('workflow')
		]
	);

	event('focus', input, () => {
		set(focused, true);
	});

	event('blur', input, () => {
		set(focused, false);
	});

	bind_value(input, () => get(tokenValue), ($$value) => set(tokenValue, $$value));
	append($$anchor, fragment);

	return pop($$exports);
}

create_custom_element(Token_input, { host: {} }, [], [], { mode: 'open' });

export { Token_input as default };
