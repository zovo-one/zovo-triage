import '../npm/ztg-svelte-internal-disclose-version.js';
import '../npm/ztg-svelte-internal-flags-legacy.js';
import { onMount } from '../npm/ztg-svelte-index-client.js';
import { get } from '../npm/ztg-svelte-internal-client-runtime.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { child } from '../npm/ztg-svelte-internal-client-dom-operations.js';
import { push, pop } from '../npm/ztg-svelte-internal-client-context.js';
import { mutable_source, set } from '../npm/ztg-svelte-internal-client-reactivity-sources.js';
import { reset } from '../npm/ztg-svelte-internal-client-dom-hydration.js';
import { from_html, append } from '../npm/ztg-svelte-internal-client-dom-template.js';
import { slot } from '../npm/ztg-svelte-internal-client-dom-blocks-slot.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import { bind_this } from '../npm/ztg-svelte-internal-client-dom-elements-bindings-this.js';
import { init } from '../npm/ztg-svelte-internal-client-dom-legacy-lifecycle.js';
import { create_custom_element } from '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import { $, $optional } from '../npm/ztg-select-dom.js';

var root = from_html(`<div style="display: contents"><!></div>`);

function Handle_expand($$anchor, $$props) {
	push($$props, false);

	let host = mutable_source();

	function onToggle(event) {
		const details = event.currentTarget;
		const rect = details.getBoundingClientRect();

		if (rect.bottom > window.innerHeight || rect.top < 0) {
			details.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		}

		if (details.open) {
			$optional('input:read-write, textarea:read-write', details)?.focus({ preventScroll: true });
		}
	}

	onMount(() => {
		const details = $('details', get(host));

		details.addEventListener('toggle', onToggle);

		return () => {
			details.removeEventListener('toggle', onToggle);
		};
	});

	init();

	var div = root();
	var node = child(div);

	slot(node, $$props, 'default', {});
	reset(div);
	bind_this(div, ($$value) => set(host, $$value), () => get(host));
	append($$anchor, div);
	pop();
}

create_custom_element(Handle_expand, {}, ['default'], [], { mode: 'open' });

export { Handle_expand as default };
