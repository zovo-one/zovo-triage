import '../npm/ztg-svelte-internal-disclose-version.js';
import { get } from '../npm/ztg-svelte-internal-client-runtime.js';
import { push, pop } from '../npm/ztg-svelte-internal-client-context.js';
import { flushSync } from '../npm/ztg-svelte-internal-client-reactivity-batch.js';
import { next } from '../npm/ztg-svelte-internal-client-dom-hydration.js';
import { first_child, sibling } from '../npm/ztg-svelte-internal-client-dom-operations.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { user_derived } from '../npm/ztg-svelte-internal-client-reactivity-deriveds.js';
import { delegate, delegated } from '../npm/ztg-svelte-internal-client-dom-elements-events.js';
import { from_html, append, text } from '../npm/ztg-svelte-internal-client-dom-template.js';
import { state, set } from '../npm/ztg-svelte-internal-client-reactivity-sources.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import { if_block } from '../npm/ztg-svelte-internal-client-dom-blocks-if.js';
import { prop } from '../npm/ztg-svelte-internal-client-reactivity-props.js';
import { create_custom_element } from '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import InfoIcon from '../npm/ztg-octicons-plain-react-components-Info.js';
import Banner from '../components/ztg-banner.svelte.js';
import Netiquette_ancient from '../components/ztg-netiquette-ancient.svelte.js';
import Timeline_item from '../components/ztg-timeline-item.svelte.js';

var root = from_html(`<button type="button" class="btn-link">comment</button>`);

var root_1 = from_html(
	`<!> If you want to say
			something helpful, you can leave a <!>. <strong>Do not</strong> report issues here.`,
	1
);

function Rgh_netiquette($$anchor, $$props) {
	push($$props, true);

	const closingDate = prop($$props, 'closingDate', 7),
		onReveal = prop($$props, 'onReveal', 7);

	let revealed = state(false);

	function reveal() {
		set(revealed, true);
		onReveal()();
	}

	var $$exports = {
		get closingDate() {
			return closingDate();
		},

		set closingDate($$value) {
			closingDate($$value);
			flushSync();
		},

		get onReveal() {
			return onReveal();
		},

		set onReveal($$value) {
			onReveal($$value);
			flushSync();
		}
	};

	Timeline_item($$anchor, {
		children: ($$anchor, $$slotProps) => {
			{
				const text$1 = ($$anchor) => {
					var fragment_2 = root_1();
					var node = first_child(fragment_2);

					Netiquette_ancient(node, {
						get closingDate() {
							return closingDate();
						}
					});

					var node_1 = sibling(node, 2);

					{
						var consequent = ($$anchor) => {
							var text_1 = text('comment');

							append($$anchor, text_1);
						};

						var alternate = ($$anchor) => {
							var button = root();

							delegated('click', button, reveal);
							append($$anchor, button);
						};

						if_block(node_1, ($$render) => {
							if (get(revealed)) $$render(consequent); else $$render(alternate, -1);
						});
					}

					next(3);
					append($$anchor, fragment_2);
				};

				let $0 = user_derived(() => [get(revealed) ? 'flash-error' : 'rgh-bg-none']);

				Banner($$anchor, {
					get classes() {
						return get($0);
					},

					get icon() {
						return InfoIcon;
					},
					text: text$1,
					$$slots: { text: true }
				});
			}
		},
		$$slots: { default: true }
	});

	return pop($$exports);
}

delegate(['click']);
create_custom_element(Rgh_netiquette, { closingDate: {}, onReveal: {} }, [], [], { mode: 'open' });

export { Rgh_netiquette as default };
