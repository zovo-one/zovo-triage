import '../npm/ztg-svelte-internal-disclose-version.js';
import { template_effect } from '../npm/ztg-svelte-internal-client-reactivity-effects.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { push, pop } from '../npm/ztg-svelte-internal-client-context.js';
import { flushSync } from '../npm/ztg-svelte-internal-client-reactivity-batch.js';
import { next, reset } from '../npm/ztg-svelte-internal-client-dom-hydration.js';
import { first_child, sibling, child } from '../npm/ztg-svelte-internal-client-dom-operations.js';
import { set_text } from '../npm/ztg-svelte-internal-client-render.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import { from_html, append, text } from '../npm/ztg-svelte-internal-client-dom-template.js';
import { if_block } from '../npm/ztg-svelte-internal-client-dom-blocks-if.js';
import { set_attribute } from '../npm/ztg-svelte-internal-client-dom-elements-attributes.js';
import { prop } from '../npm/ztg-svelte-internal-client-reactivity-props.js';
import { create_custom_element } from '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import { isPR } from '../npm/ztg-github-url-detection.js';
import twas from '../npm/ztg-twas-index.es.js';
import { areIssuesEnabled, areDiscussionsEnabled, buildRepoUrl } from '../github-helpers/ztg-index.js';

var root = from_html(`<a>new issue</a>`);
var root_1 = from_html(`<a>new discussion</a>`);
var root_2 = from_html(`Please consider opening a <!> <!> <!> instead of leaving a comment here.`, 1);
var root_3 = from_html(` <strong> </strong>. <!>`, 1);

function Netiquette_ancient($$anchor, $$props) {
	push($$props, true);

	const closingDate = prop($$props, 'closingDate', 7);
	const issuesEnabled = areIssuesEnabled();
	const discussionsEnabled = areDiscussionsEnabled();

	var $$exports = {
		get closingDate() {
			return closingDate();
		},

		set closingDate($$value) {
			closingDate($$value);
			flushSync();
		}
	};

	next();

	var fragment = root_3();
	var text$1 = first_child(fragment);
	var strong = sibling(text$1);
	var text_1 = child(strong, true);

	reset(strong);

	var node = sibling(strong, 2);

	{
		var consequent_3 = ($$anchor) => {
			var fragment_1 = root_2();
			var node_1 = sibling(first_child(fragment_1));

			{
				var consequent = ($$anchor) => {
					var a = root();

					template_effect(($0) => set_attribute(a, 'href', $0), [() => buildRepoUrl('issues/new/choose')]);
					append($$anchor, a);
				};

				if_block(node_1, ($$render) => {
					if (issuesEnabled) $$render(consequent);
				});
			}

			var node_2 = sibling(node_1, 2);

			{
				var consequent_1 = ($$anchor) => {
					var text_2 = text('or a');

					append($$anchor, text_2);
				};

				if_block(node_2, ($$render) => {
					if (issuesEnabled && discussionsEnabled) $$render(consequent_1);
				});
			}

			var node_3 = sibling(node_2, 2);

			{
				var consequent_2 = ($$anchor) => {
					var a_1 = root_1();

					template_effect(($0) => set_attribute(a_1, 'href', $0), [() => buildRepoUrl('discussions/new/choose')]);
					append($$anchor, a_1);
				};

				if_block(node_3, ($$render) => {
					if (discussionsEnabled) $$render(consequent_2);
				});
			}

			next();
			append($$anchor, fragment_1);
		};

		if_block(node, ($$render) => {
			if (issuesEnabled || discussionsEnabled) $$render(consequent_3);
		});
	}

	template_effect(
		($0, $1) => {
			set_text(text$1, `This ${$0 ?? ''} was closed `);
			set_text(text_1, $1);
		},
		[
			() => isPR() ? 'PR' : 'issue',
			() => twas(closingDate().getTime())
		]
	);

	append($$anchor, fragment);

	return pop($$exports);
}

create_custom_element(Netiquette_ancient, { closingDate: {} }, [], [], { mode: 'open' });

export { Netiquette_ancient as default };
