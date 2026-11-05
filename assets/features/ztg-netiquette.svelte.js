import '../npm/ztg-svelte-internal-disclose-version.js';
import { get } from '../npm/ztg-svelte-internal-client-runtime.js';
import { push, pop } from '../npm/ztg-svelte-internal-client-context.js';
import { flushSync } from '../npm/ztg-svelte-internal-client-reactivity-batch.js';
import { next, reset } from '../npm/ztg-svelte-internal-client-dom-hydration.js';
import { first_child, child, sibling } from '../npm/ztg-svelte-internal-client-dom-operations.js';
import { template_effect } from '../npm/ztg-svelte-internal-client-reactivity-effects.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { from_html, comment, append } from '../npm/ztg-svelte-internal-client-dom-template.js';
import { user_derived } from '../npm/ztg-svelte-internal-client-reactivity-deriveds.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import { await_block } from '../npm/ztg-svelte-internal-client-dom-blocks-await.js';
import { if_block } from '../npm/ztg-svelte-internal-client-dom-blocks-if.js';
import { clsx as clsx$1 } from '../npm/ztg-svelte-internal-shared-attributes.js';
import { set_class } from '../npm/ztg-svelte-internal-client-dom-elements-class.js';
import { prop } from '../npm/ztg-svelte-internal-client-reactivity-props.js';
import { create_custom_element } from '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import { clsx } from '../npm/ztg-clsx-clsx.js';
import { isDraftPR } from '../npm/ztg-github-url-detection.js';
import FlameIcon from '../npm/ztg-octicons-plain-react-components-Flame.js';
import GitPullRequestDraftIcon from '../npm/ztg-octicons-plain-react-components-GitPullRequestDraft.js';
import InfoIcon from '../npm/ztg-octicons-plain-react-components-Info.js';
import { countElements, $optional, elementExists } from '../npm/ztg-select-dom.js';
import Dom_chef from '../components/ztg-dom-chef.svelte.js';
import Netiquette_ancient from '../components/ztg-netiquette-ancient.svelte.js';
import { userIsModerator } from '../github-helpers/ztg-get-user-permission.js';
import { isOwnConversation, isRefinedGitHubRepo } from '../github-helpers/ztg-index.js';
import { wasLongAgo, getCloseDate } from '../github-helpers/ztg-netiquette.js';
import looseParseInt from '../helpers/ztg-loose-parse-int.js';

var root = from_html(`<div><!> <span>This is a <strong>draft PR</strong>, it might not be ready for
			review.</span></div>`);

var root_1 = from_html(`<div><!> <span>This issue is highly active. Reconsider commenting unless you
						have read all the comments and have something to add.</span></div>`);

var root_2 = from_html(`<div><!> <span><!></span></div>`);
var root_3 = from_html(`<!> <!>`, 1);

function Netiquette($$anchor, $$props) {
	push($$props, true);

	const legacy = prop($$props, 'legacy', 7);

	const flashClass = user_derived(() => clsx('d-flex flex-items-center gap-2 fgColor-muted bgColor-accent-muted', legacy()
		? 'tmp-p-2 p-2 m-2 rounded-2'
		: 'tmp-p-3 p-4 border-bottom'));

	function isPopular() {
		return (// TODO: Update comment counter
		countElements('[data-testid="comment-header"]') > 30 || // This element only appears after 6 participants
		looseParseInt($optional('[aria-label*="other participants"]')?.ariaLabel) > 20 || elementExists('[data-testid="issue-timeline-load-more-count-front"]') || // TODO [2027-01-01]: Drop after the legacy PR view is removed
		countElements('.timeline-comment') > 30);
	}

	var $$exports = {
		get legacy() {
			return legacy();
		},

		set legacy($$value) {
			legacy($$value);
			flushSync();
		}
	};

	var fragment = comment();
	var node = first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var div = root();
			var node_1 = child(div);

			Dom_chef(node_1, {
				get as() {
					return GitPullRequestDraftIcon;
				}
			});

			next(2);
			reset(div);
			template_effect(() => set_class(div, 1, clsx$1(get(flashClass))));
			append($$anchor, div);
		};

		var d = user_derived(() => isDraftPR() && !isOwnConversation());

		var alternate = ($$anchor) => {
			var fragment_1 = root_3();
			var node_2 = first_child(fragment_1);

			{
				var consequent_2 = ($$anchor) => {
					var fragment_2 = comment();
					var node_3 = first_child(fragment_2);

					await_block(node_3, userIsModerator, null, ($$anchor, isModerator) => {
						var fragment_3 = comment();
						var node_4 = first_child(fragment_3);

						{
							var consequent_1 = ($$anchor) => {
								var div_1 = root_1();
								var node_5 = child(div_1);

								Dom_chef(node_5, {
									get as() {
										return FlameIcon;
									}
								});

								next(2);
								reset(div_1);
								template_effect(() => set_class(div_1, 1, clsx$1(get(flashClass))));
								append($$anchor, div_1);
							};

							if_block(node_4, ($$render) => {
								if (!get(isModerator)) $$render(consequent_1);
							});
						}

						append($$anchor, fragment_3);
					});

					append($$anchor, fragment_2);
				};

				var d_1 = user_derived(() => isPopular());

				if_block(node_2, ($$render) => {
					if (get(d_1)) $$render(consequent_2);
				});
			}

			var node_6 = sibling(node_2, 2);

			{
				var consequent_4 = ($$anchor) => {
					var fragment_4 = comment();
					var node_7 = first_child(fragment_4);

					await_block(node_7, getCloseDate, null, ($$anchor, date) => {
						var fragment_5 = comment();
						var node_8 = first_child(fragment_5);

						{
							var consequent_3 = ($$anchor) => {
								var div_2 = root_2();
								var node_9 = child(div_2);

								Dom_chef(node_9, {
									get as() {
										return InfoIcon;
									}
								});

								var span = sibling(node_9, 2);
								var node_10 = child(span);

								Netiquette_ancient(node_10, {
									get closingDate() {
										return get(date);
									}
								});

								reset(span);
								reset(div_2);
								template_effect(() => set_class(div_2, 1, clsx$1(get(flashClass))));
								append($$anchor, div_2);
							};

							var d_2 = user_derived(() => get(date) && wasLongAgo(get(date)));

							if_block(node_8, ($$render) => {
								if (get(d_2)) $$render(consequent_3);
							});
						}

						append($$anchor, fragment_5);
					});

					append($$anchor, fragment_4);
				};

				var d_3 = user_derived(() => !isRefinedGitHubRepo());

				if_block(node_6, ($$render) => {
					if (get(d_3)) $$render(consequent_4);
				});
			}

			append($$anchor, fragment_1);
		};

		if_block(node, ($$render) => {
			if (get(d)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	append($$anchor, fragment);

	return pop($$exports);
}

create_custom_element(Netiquette, { legacy: {} }, [], [], { mode: 'open' });

export { Netiquette as default };
