import '../npm/ztg-svelte-internal-disclose-version.js';
import { get } from '../npm/ztg-svelte-internal-client-runtime.js';
import { push, pop } from '../npm/ztg-svelte-internal-client-context.js';
import { flushSync } from '../npm/ztg-svelte-internal-client-reactivity-batch.js';
import { reset } from '../npm/ztg-svelte-internal-client-dom-hydration.js';
import { first_child, child, sibling } from '../npm/ztg-svelte-internal-client-dom-operations.js';
import { template_effect } from '../npm/ztg-svelte-internal-client-reactivity-effects.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { from_html, append } from '../npm/ztg-svelte-internal-client-dom-template.js';
import { user_derived } from '../npm/ztg-svelte-internal-client-reactivity-deriveds.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import { if_block } from '../npm/ztg-svelte-internal-client-dom-blocks-if.js';
import { prop } from '../npm/ztg-svelte-internal-client-reactivity-props.js';
import { store_get, setup_stores } from '../npm/ztg-svelte-internal-client-reactivity-store.js';
import { create_custom_element } from '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import BellIcon from '../npm/ztg-octicons-plain-react-components-Bell.js';
import BellSlashIcon from '../npm/ztg-octicons-plain-react-components-BellSlash.js';
import IssueReopenedIcon from '../npm/ztg-octicons-plain-react-components-IssueReopened.js';
import Status_subscription_button from '../components/ztg-status-subscription-button.svelte.js';

var root = from_html(`<input type="hidden" name="events[]" value="merged"/> <input type="hidden" name="events[]" value="closed"/> <input type="hidden" name="events[]" value="reopened"/>`, 1);
var root_1 = from_html(`<fieldset class="BtnGroup d-flex width-full"><!> <!> <!></fieldset> <!>`, 1);

function Status_subscription($$anchor, $$props) {
	push($$props, true);

	const $disabled = () => store_get(disabled(), '$disabled', $$stores);
	const $status = () => store_get(status(), '$status', $$stores);
	const [$$stores, $$cleanup] = setup_stores();

	const status = prop($$props, 'status', 7),
		disabled = prop($$props, 'disabled', 7),
		isLegacy = prop($$props, 'isLegacy', 7),
		onNone = prop($$props, 'onNone', 7),
		onAll = prop($$props, 'onAll', 7),
		onStatus = prop($$props, 'onStatus', 7);

	var $$exports = {
		get status() {
			return status();
		},

		set status($$value) {
			status($$value);
			flushSync();
		},

		get disabled() {
			return disabled();
		},

		set disabled($$value) {
			disabled($$value);
			flushSync();
		},

		get isLegacy() {
			return isLegacy();
		},

		set isLegacy($$value) {
			isLegacy($$value);
			flushSync();
		},

		get onNone() {
			return onNone();
		},

		set onNone($$value) {
			onNone($$value);
			flushSync();
		},

		get onAll() {
			return onAll();
		},

		set onAll($$value) {
			onAll($$value);
			flushSync();
		},

		get onStatus() {
			return onStatus();
		},

		set onStatus($$value) {
			onStatus($$value);
			flushSync();
		}
	};

	var fragment = root_1();
	var fieldset = first_child(fragment);
	var node = child(fieldset);

	{
		let $0 = user_derived(() => $status() === 'none');

		Status_subscription_button(node, {
			id: 'rgh-sub-none',
			value: 'unsubscribe',
			get icon() {
				return BellSlashIcon;
			},
			label: 'None',
			tooltip: 'Unsubscribe',
			get active() {
				return get($0);
			},

			get isLegacy() {
				return isLegacy();
			},

			get onclick() {
				return onNone();
			}
		});
	}

	var node_1 = sibling(node, 2);

	{
		let $0 = user_derived(() => $status() === 'all');

		Status_subscription_button(node_1, {
			id: 'rgh-sub-all',
			value: 'subscribe',
			get icon() {
				return BellIcon;
			},
			label: 'All',
			tooltip: 'Subscribe to all events',
			get active() {
				return get($0);
			},

			get isLegacy() {
				return isLegacy();
			},

			get onclick() {
				return onAll();
			}
		});
	}

	var node_2 = sibling(node_1, 2);

	{
		let $0 = user_derived(() => $status() === 'status');

		Status_subscription_button(node_2, {
			id: 'rgh-sub-status',
			value: 'subscribe_to_custom_notifications',
			get icon() {
				return IssueReopenedIcon;
			},
			label: 'Status',
			tooltip: 'Subscribe only to closing, reopening, merging',
			get active() {
				return get($0);
			},

			get isLegacy() {
				return isLegacy();
			},

			get onclick() {
				return onStatus();
			}
		});
	}

	reset(fieldset);

	var node_3 = sibling(fieldset, 2);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = root();
			var input = first_child(fragment_1);
			var input_1 = sibling(input, 2);
			sibling(input_1, 2);

			append($$anchor, fragment_1);
		};

		if_block(node_3, ($$render) => {
			if (isLegacy()) $$render(consequent);
		});
	}

	template_effect(() => fieldset.disabled = $disabled());
	append($$anchor, fragment);

	var $$pop = pop($$exports);

	$$cleanup();

	return $$pop;
}

create_custom_element(
	Status_subscription,
	{
		status: {},
		disabled: {},
		isLegacy: {},
		onNone: {},
		onAll: {},
		onStatus: {}
	},
	[],
	[],
	{ mode: 'open' }
);

export { Status_subscription as default };
