import '../npm/ztg-svelte-internal-disclose-version.js';
import { get } from '../npm/ztg-svelte-internal-client-runtime.js';
import { noop } from '../npm/ztg-svelte-internal-shared-utils.js';
import { push, pop } from '../npm/ztg-svelte-internal-client-context.js';
import { flushSync } from '../npm/ztg-svelte-internal-client-reactivity-batch.js';
import { reset } from '../npm/ztg-svelte-internal-client-dom-hydration.js';
import { set_text } from '../npm/ztg-svelte-internal-client-render.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { template_effect } from '../npm/ztg-svelte-internal-client-reactivity-effects.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import { from_html, comment, append } from '../npm/ztg-svelte-internal-client-dom-template.js';
import { first_child, child } from '../npm/ztg-svelte-internal-client-dom-operations.js';
import { user_derived } from '../npm/ztg-svelte-internal-client-reactivity-deriveds.js';
import { await_block } from '../npm/ztg-svelte-internal-client-dom-blocks-await.js';
import { if_block } from '../npm/ztg-svelte-internal-client-dom-blocks-if.js';
import { set_attribute } from '../npm/ztg-svelte-internal-client-dom-elements-attributes.js';
import { set_class } from '../npm/ztg-svelte-internal-client-dom-elements-class.js';
import { clsx } from '../npm/ztg-svelte-internal-shared-attributes.js';
import { prop } from '../npm/ztg-svelte-internal-client-reactivity-props.js';
import { create_custom_element } from '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import api from '../github-helpers/ztg-api.js';
import { excludeFromDomTextExtraction } from '../github-helpers/ztg-parse-rendered-text.js';
import pluralize from '../helpers/ztg-pluralize.js';
import { getFeatureRelatedIssuesUrl, getFeatureRelatedIssuesQuery } from '../helpers/ztg-rgh-links.js';

var root = from_html(`<a data-turbo-frame="repo-content-turbo-frame"> </a>`);

function Related_issues_count($$anchor, $$props) {
	push($$props, true);

	const linked = ($$anchor, text = noop, tooltip = noop) => {
		var a = root();
		let classes;
		var text_1 = child(a, true);

		reset(a);

		template_effect(() => {
			set_attribute(a, 'href', get(relatedIssuesHref));
			classes = set_class(a, 1, clsx(excludeFromDomTextExtraction), null, classes, { tooltipped: tooltip(), 'tooltipped-n': tooltip() });
			set_attribute(a, 'aria-label', tooltip() || undefined);
			set_text(text_1, text());
		});

		append($$anchor, a);
	};

	const featureId = prop($$props, 'featureId', 7),
		mini = prop($$props, 'mini', 7, false);

	const relatedIssuesHref = user_derived(() => getFeatureRelatedIssuesUrl(featureId()).href);

	const countPromise = user_derived(async () => {
		const query = `${getFeatureRelatedIssuesQuery(featureId())} repo:refined-github/refined-github`;
		const response = await api.v3(`/search/issues?q=${encodeURIComponent(query)}`);

		return response.total_count;
	});

	var $$exports = {
		get featureId() {
			return featureId();
		},

		set featureId($$value) {
			featureId($$value);
			flushSync();
		},

		get mini() {
			return mini();
		},

		set mini($$value = false) {
			mini($$value);
			flushSync();
		}
	};

	var fragment = comment();
	var node = first_child(fragment);

	await_block(
		node,
		() => get(countPromise),
		($$anchor) => {
			var fragment_5 = comment();
			var node_3 = first_child(fragment_5);

			{
				var consequent_2 = ($$anchor) => {
					linked($$anchor, () => 'Related issues');
				};

				if_block(node_3, ($$render) => {
					if (!mini()) $$render(consequent_2);
				});
			}

			append($$anchor, fragment_5);
		},
		($$anchor, count) => {
			const openIssuesLabel = user_derived(() => pluralize(get(count), '1 open issue', '$$ open issues', 'Related issues'));
			var fragment_1 = comment();
			var node_1 = first_child(fragment_1);

			{
				var consequent_1 = ($$anchor) => {
					var fragment_2 = comment();
					var node_2 = first_child(fragment_2);

					{
						var consequent = ($$anchor) => {
							{
								let $0 = user_derived(() => String(get(count)));

								linked($$anchor, () => get($0), () => get(openIssuesLabel));
							}
						};

						if_block(node_2, ($$render) => {
							if (get(count) > 0) $$render(consequent);
						});
					}

					append($$anchor, fragment_2);
				};

				var alternate = ($$anchor) => {
					linked($$anchor, () => get(openIssuesLabel));
				};

				if_block(node_1, ($$render) => {
					if (mini()) $$render(consequent_1); else $$render(alternate, -1);
				});
			}

			append($$anchor, fragment_1);
		}
	);

	append($$anchor, fragment);

	return pop($$exports);
}

create_custom_element(Related_issues_count, { featureId: {}, mini: {} }, [], [], { mode: 'open' });

export { Related_issues_count as default };
