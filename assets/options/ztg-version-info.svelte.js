import '../npm/ztg-svelte-internal-disclose-version.js';
import '../npm/ztg-svelte-internal-flags-legacy.js';
import { get } from '../npm/ztg-svelte-internal-client-runtime.js';
import { push, pop } from '../npm/ztg-svelte-internal-client-context.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { child, sibling, first_child } from '../npm/ztg-svelte-internal-client-dom-operations.js';
import { template_effect } from '../npm/ztg-svelte-internal-client-reactivity-effects.js';
import { user_derived } from '../npm/ztg-svelte-internal-client-reactivity-deriveds.js';
import { reset, next } from '../npm/ztg-svelte-internal-client-dom-hydration.js';
import { set_text } from '../npm/ztg-svelte-internal-client-render.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import { from_html, append } from '../npm/ztg-svelte-internal-client-dom-template.js';
import { if_block } from '../npm/ztg-svelte-internal-client-dom-blocks-if.js';
import { init } from '../npm/ztg-svelte-internal-client-dom-legacy-lifecycle.js';
import { create_custom_element } from '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import { getExtensionReleaseDate, toDaysAgo, wasReleasedLongAgo } from '../helpers/ztg-extension-release-age.js';

var root = from_html(` <a href="https://github.com/refined-github/refined-github#install">A newer version may be available</a>`, 1);
var root_1 = from_html(`<output> <!></output>`);

function Version_info($$anchor, $$props) {
	push($$props, false);

	const { version } = chrome.runtime.getManifest();
	const releaseDate = getExtensionReleaseDate();
	const releaseAgeInDays = toDaysAgo(releaseDate);

	init();

	var output = root_1();
	var text = child(output);
	var node = sibling(text);

	{
		var consequent = ($$anchor) => {
			var fragment = root();
			var text_1 = first_child(fragment);

			next();
			template_effect(() => set_text(text_1, `— Released ${releaseAgeInDays ?? ''} days ago. `));
			append($$anchor, fragment);
		};

		var d = user_derived(() => wasReleasedLongAgo(releaseAgeInDays));

		if_block(node, ($$render) => {
			if (get(d)) $$render(consequent);
		});
	}

	reset(output);
	template_effect(() => set_text(text, `${version ?? ''} `));
	append($$anchor, output);
	pop();
}

create_custom_element(Version_info, {}, [], [], { mode: 'open' });

export { Version_info as default };
