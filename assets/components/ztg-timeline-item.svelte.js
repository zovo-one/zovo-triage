import '../npm/ztg-svelte-internal-disclose-version.js';
import '../npm/ztg-svelte-internal-flags-legacy.js';
import { template_effect } from '../npm/ztg-svelte-internal-client-reactivity-effects.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { push, pop } from '../npm/ztg-svelte-internal-client-context.js';
import { child } from '../npm/ztg-svelte-internal-client-dom-operations.js';
import { reset } from '../npm/ztg-svelte-internal-client-dom-hydration.js';
import { from_html, append } from '../npm/ztg-svelte-internal-client-dom-template.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import { slot } from '../npm/ztg-svelte-internal-client-dom-blocks-slot.js';
import { clsx } from '../npm/ztg-svelte-internal-shared-attributes.js';
import { set_class } from '../npm/ztg-svelte-internal-client-dom-elements-class.js';
import { init } from '../npm/ztg-svelte-internal-client-dom-legacy-lifecycle.js';
import { create_custom_element } from '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import { clsx as clsx$1 } from '../npm/ztg-clsx-clsx.js';
import { isPRConversation } from '../npm/ztg-github-url-detection.js';

var root = from_html(`<div><!></div>`);

function Timeline_item($$anchor, $$props) {
	push($$props, false);
	init();

	var div = root();
	var node = child(div);

	slot(node, $$props, 'default', {});
	reset(div);

	template_effect(($0) => set_class(div, 1, $0), [
		() => clsx(clsx$1(
			'mt-3 tmp-mt-3',
			// TODO: Drop after the legacy PR conversation is gone
			// https://github.com/refined-github/refined-github/pull/9901
			isPRConversation() && 'ml-0 tmp-ml-0 pl-0 tmp-pl-0 ml-md-6 tmp-ml-md-6 pl-md-3 tmp-pl-md-3 mt-3 tmp-mt-3'
		))
	]);

	append($$anchor, div);
	pop();
}

create_custom_element(Timeline_item, {}, ['default'], [], { mode: 'open' });

export { Timeline_item as default };
