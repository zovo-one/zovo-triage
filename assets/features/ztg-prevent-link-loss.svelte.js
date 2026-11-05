import '../npm/ztg-svelte-internal-disclose-version.js';
import { onMount } from '../npm/ztg-svelte-index-client.js';
import { get } from '../npm/ztg-svelte-internal-client-runtime.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { first_child } from '../npm/ztg-svelte-internal-client-dom-operations.js';
import { push, pop } from '../npm/ztg-svelte-internal-client-context.js';
import { flushSync } from '../npm/ztg-svelte-internal-client-reactivity-batch.js';
import { next } from '../npm/ztg-svelte-internal-client-dom-hydration.js';
import { state, set } from '../npm/ztg-svelte-internal-client-reactivity-sources.js';
import { from_html, comment, append, text } from '../npm/ztg-svelte-internal-client-dom-template.js';
import { if_block } from '../npm/ztg-svelte-internal-client-dom-blocks-if.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import { append_styles } from '../npm/ztg-svelte-internal-client-dom-css.js';
import { prop } from '../npm/ztg-svelte-internal-client-reactivity-props.js';
import { create_custom_element } from '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import debounceFunction from '../npm/ztg-debounce-fn.js';
import AlertIcon from '../npm/ztg-octicons-plain-react-components-Alert.js';
import Banner_action from '../components/ztg-banner-action.svelte.js';
import Banner from '../components/ztg-banner.svelte.js';
import { isVulnerableToLinkLoss, avoidLinkLoss } from '../github-helpers/ztg-prevent-link-loss.js';

var root = from_html(`Your link may be <a href="https://github.com/refined-github/refined-github/wiki/Extended-feature-descriptions#prevent-link-loss" target="_blank" rel="noopener noreferrer" data-hovercard-type="issue">misinterpreted</a> by GitHub.`, 1);

const $$css = {
	hash: 'svelte-c56s47',
	code: '\n	/* Old views (PRs) require extra margin #9402  */file-attachment ~ .rgh-prevent-link-loss {margin:0 8px 8px !important;}'
};

function Prevent_link_loss($$anchor, $$props) {
	push($$props, true);
	append_styles($$anchor, $$css);

	const field = prop($$props, 'field', 7);
	let visible = state(false);

	function update() {
		set(visible, isVulnerableToLinkLoss(field().value), true);
	}

	const debouncedUpdate = debounceFunction(update, { wait: 300 });

	function fix() {
		avoidLinkLoss(field());
		update();
	}

	onMount(() => {
		update();

		const controller = new AbortController();

		field().addEventListener('input', debouncedUpdate, { signal: controller.signal });
		field().addEventListener('focus', update, { signal: controller.signal });

		return () => {
			controller.abort();
		};
	});

	var $$exports = {
		get field() {
			return field();
		},

		set field($$value) {
			field($$value);
			flushSync();
		}
	};

	var fragment = comment();
	var node = first_child(fragment);

	{
		var consequent = ($$anchor) => {
			{
				const text$1 = ($$anchor) => {
					next();

					var fragment_2 = root();

					next(2);
					append($$anchor, fragment_2);
				};

				Banner($$anchor, {
					classes: ['rgh-prevent-link-loss', 'flash-warn', 'mt-2'],
					get icon() {
						return AlertIcon;
					},
					text: text$1,
					children: ($$anchor, $$slotProps) => {
						Banner_action($$anchor, {
							action: fix,
							children: ($$anchor, $$slotProps) => {
								next();

								var text_1 = text('Fix link');

								append($$anchor, text_1);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { text: true, default: true }
				});
			}
		};

		if_block(node, ($$render) => {
			if (get(visible)) $$render(consequent);
		});
	}

	append($$anchor, fragment);

	return pop($$exports);
}

create_custom_element(Prevent_link_loss, { field: {} }, [], [], { mode: 'open' });

export { Prevent_link_loss as default };
