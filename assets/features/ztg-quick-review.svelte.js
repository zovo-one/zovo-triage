import '../npm/ztg-svelte-internal-disclose-version.js';
import { get } from '../npm/ztg-svelte-internal-client-runtime.js';
import { push, pop } from '../npm/ztg-svelte-internal-client-context.js';
import { flushSync } from '../npm/ztg-svelte-internal-client-reactivity-batch.js';
import { reset } from '../npm/ztg-svelte-internal-client-dom-hydration.js';
import { sibling, child, first_child } from '../npm/ztg-svelte-internal-client-dom-operations.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { delegate, event, delegated } from '../npm/ztg-svelte-internal-client-dom-elements-events.js';
import { from_html, comment, append } from '../npm/ztg-svelte-internal-client-dom-template.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import { await_block } from '../npm/ztg-svelte-internal-client-dom-blocks-await.js';
import { if_block } from '../npm/ztg-svelte-internal-client-dom-blocks-if.js';
import { set_attribute } from '../npm/ztg-svelte-internal-client-dom-elements-attributes.js';
import { prop } from '../npm/ztg-svelte-internal-client-reactivity-props.js';
import { create_custom_element } from '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import { isClosedConversation } from '../npm/ztg-github-url-detection.js';
import Tooltip from '../components/ztg-tooltip.svelte.js';
import { getLoggedInUser, getConversationAuthor } from '../github-helpers/ztg-index.js';
import { getToken } from '../ztg-options-storage.js';

var root = from_html(`– <button type="button" class="btn-link Link--muted Link--inTextBlock rgh-quick-approve">approve now</button> <!>`, 1);
var root_1 = from_html(`<span class="text-normal color-fg-muted">– <a class="rgh-quick-review btn-link Link--muted Link--inTextBlock" data-turbo-frame="repo-content-turbo-frame" data-hotkey="v">review now</a> <!> <!></span>`);

function Quick_review($$anchor, $$props) {
	push($$props, true);

	const onReview = prop($$props, 'onReview', 7),
		onApprove = prop($$props, 'onApprove', 7),
		onPreload = prop($$props, 'onPreload', 7);

	const canApprovePromise = // Can't approve own PRs and closed PRs
	getLoggedInUser() !== getConversationAuthor() && !isClosedConversation() && // API required for this action
	getToken();

	const reviewId = 'rgh-quick-review';
	const approveId = 'rgh-quick-approve';

	var $$exports = {
		get onReview() {
			return onReview();
		},

		set onReview($$value) {
			onReview($$value);
			flushSync();
		},

		get onApprove() {
			return onApprove();
		},

		set onApprove($$value) {
			onApprove($$value);
			flushSync();
		},

		get onPreload() {
			return onPreload();
		},

		set onPreload($$value) {
			onPreload($$value);
			flushSync();
		}
	};

	var span = root_1();
	var a = sibling(child(span));

	set_attribute(a, 'id', reviewId);
	set_attribute(a, 'href', location.pathname + `/files#review-changes-modal`);
	set_attribute(a, 'aria-labelledby', 'rgh-quick-review-tooltip');

	var node = sibling(a, 2);

	Tooltip(node, {
		id: 'rgh-quick-review-tooltip',
		htmlFor: reviewId,
		label: 'Review now',
		shortcut: 'v'
	});

	var node_1 = sibling(node, 2);

	await_block(node_1, () => canApprovePromise, null, ($$anchor, canApprove) => {
		var fragment = comment();
		var node_2 = first_child(fragment);

		{
			var consequent = ($$anchor) => {
				var fragment_1 = root();
				var button = sibling(first_child(fragment_1));

				set_attribute(button, 'id', approveId);
				set_attribute(button, 'aria-labelledby', 'rgh-quick-approve-tooltip');

				var node_3 = sibling(button, 2);

				Tooltip(node_3, {
					id: 'rgh-quick-approve-tooltip',
					htmlFor: approveId,
					label: 'Hold alt to approve without confirmation'
				});

				delegated('click', button, function (...$$args) {
					onApprove()?.apply(this, $$args);
				});

				append($$anchor, fragment_1);
			};

			if_block(node_2, ($$render) => {
				if (get(canApprove)) $$render(consequent);
			});
		}

		append($$anchor, fragment);
	});

	reset(span);

	event('mouseenter', a, function (...$$args) {
		onPreload()?.apply(this, $$args);
	});

	delegated('click', a, function (...$$args) {
		onReview()?.apply(this, $$args);
	});

	append($$anchor, span);

	return pop($$exports);
}

delegate(['click']);
create_custom_element(Quick_review, { onReview: {}, onApprove: {}, onPreload: {} }, [], [], { mode: 'open' });

export { Quick_review as default };
