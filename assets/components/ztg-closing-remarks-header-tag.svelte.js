import '../npm/ztg-svelte-internal-disclose-version.js';
import { get } from '../npm/ztg-svelte-internal-client-runtime.js';
import { push, pop } from '../npm/ztg-svelte-internal-client-context.js';
import { flushSync } from '../npm/ztg-svelte-internal-client-reactivity-batch.js';
import { reset } from '../npm/ztg-svelte-internal-client-dom-hydration.js';
import { set_text } from '../npm/ztg-svelte-internal-client-render.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { template_effect } from '../npm/ztg-svelte-internal-client-reactivity-effects.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import { from_html, append } from '../npm/ztg-svelte-internal-client-dom-template.js';
import { child, sibling } from '../npm/ztg-svelte-internal-client-dom-operations.js';
import { user_derived } from '../npm/ztg-svelte-internal-client-reactivity-deriveds.js';
import { set_attribute } from '../npm/ztg-svelte-internal-client-dom-elements-attributes.js';
import { prop } from '../npm/ztg-svelte-internal-client-reactivity-props.js';
import { create_custom_element } from '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import TagIcon from '../npm/ztg-octicons-plain-react-components-Tag.js';
import { buildRepoUrl } from '../github-helpers/ztg-index.js';
import Dom_chef from './ztg-dom-chef.svelte.js';

var root = from_html(`<a class="text-bold Link--primary no-underline"><!> </a>`);

function Closing_remarks_header_tag($$anchor, $$props) {
	push($$props, true);

	const tagName = prop($$props, 'tagName', 7);
	const tagUrl = user_derived(() => buildRepoUrl('releases/tag', tagName()));

	var $$exports = {
		get tagName() {
			return tagName();
		},

		set tagName($$value) {
			tagName($$value);
			flushSync();
		}
	};

	var a = root();
	var node = child(a);

	Dom_chef(node, {
		get as() {
			return TagIcon;
		},
		class: 'mr-1 tmp-mr-1 color-fg-muted'
	});

	var text = sibling(node);

	reset(a);

	template_effect(() => {
		set_attribute(a, 'href', get(tagUrl));
		set_attribute(a, 'title', `${tagName() ?? ''} was the first Git tag to include this pull request`);
		set_text(text, ` ${tagName() ?? ''}`);
	});

	append($$anchor, a);

	return pop($$exports);
}

create_custom_element(Closing_remarks_header_tag, { tagName: {} }, [], [], { mode: 'open' });

export { Closing_remarks_header_tag as default };
