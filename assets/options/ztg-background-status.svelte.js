import '../npm/ztg-svelte-internal-disclose-version.js';
import '../npm/ztg-svelte-internal-flags-legacy.js';
import { get } from '../npm/ztg-svelte-internal-client-runtime.js';
import { push, pop } from '../npm/ztg-svelte-internal-client-context.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { first_child } from '../npm/ztg-svelte-internal-client-dom-operations.js';
import { from_html, comment, append } from '../npm/ztg-svelte-internal-client-dom-template.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import { await_block } from '../npm/ztg-svelte-internal-client-dom-blocks-await.js';
import { if_block } from '../npm/ztg-svelte-internal-client-dom-blocks-if.js';
import { init } from '../npm/ztg-svelte-internal-client-dom-legacy-lifecycle.js';
import { create_custom_element } from '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import { messageRuntime } from '../npm/ztg-webext-msg.js';
import delay from '../helpers/ztg-delay.js';

var root = from_html(`<p class="error-banner">It seems that the background page failed to load. This breaks some
			features. Please <a href="https://github.com/refined-github/refined-github/issues/new?template=1_bug_report.yml">report it</a>.</p>`);

function Background_status($$anchor, $$props) {
	push($$props, false);

	const ping = Promise.race([
		messageRuntime({ ping: true }).catch(() => undefined),
		delay(500)
	]);

	init();

	var fragment = comment();
	var node = first_child(fragment);

	await_block(node, () => ping, null, ($$anchor, response) => {
		var fragment_1 = comment();
		var node_1 = first_child(fragment_1);

		{
			var consequent = ($$anchor) => {
				var p = root();

				append($$anchor, p);
			};

			if_block(node_1, ($$render) => {
				if (get(response) !== 'pong') $$render(consequent);
			});
		}

		append($$anchor, fragment_1);
	});

	append($$anchor, fragment);
	pop();
}

create_custom_element(Background_status, {}, [], [], { mode: 'open' });

export { Background_status as default };
