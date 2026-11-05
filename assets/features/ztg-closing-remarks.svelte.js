import '../npm/ztg-svelte-internal-disclose-version.js';
import { get } from '../npm/ztg-svelte-internal-client-runtime.js';
import { push, pop } from '../npm/ztg-svelte-internal-client-context.js';
import { flushSync } from '../npm/ztg-svelte-internal-client-reactivity-batch.js';
import { next, reset } from '../npm/ztg-svelte-internal-client-dom-hydration.js';
import { set_text } from '../npm/ztg-svelte-internal-client-render.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { template_effect } from '../npm/ztg-svelte-internal-client-reactivity-effects.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import { from_html, comment, append, text } from '../npm/ztg-svelte-internal-client-dom-template.js';
import { first_child, sibling, child } from '../npm/ztg-svelte-internal-client-dom-operations.js';
import { user_derived } from '../npm/ztg-svelte-internal-client-reactivity-deriveds.js';
import { await_block } from '../npm/ztg-svelte-internal-client-dom-blocks-await.js';
import { if_block } from '../npm/ztg-svelte-internal-client-dom-blocks-if.js';
import { set_attribute } from '../npm/ztg-svelte-internal-client-dom-elements-attributes.js';
import { prop } from '../npm/ztg-svelte-internal-client-reactivity-props.js';
import { create_custom_element } from '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import TagIcon from '../npm/ztg-octicons-plain-react-components-Tag.js';
import Banner_action from '../components/ztg-banner-action.svelte.js';
import Banner from '../components/ztg-banner.svelte.js';
import Timeline_item from '../components/ztg-timeline-item.svelte.js';
import { userHasPushAccess } from '../github-helpers/ztg-get-user-permission.js';
import { buildRepoUrl, isRefinedGitHubRepo } from '../github-helpers/ztg-index.js';
import { doesRepoHaveAnyTags } from './ztg-releases-tab.js';

var root = from_html(`This pull request first <a>appeared</a> in <a class="Link--primary text-bold"> </a>`, 1);
var root_1 = from_html(`This PR hasn't been released yet, <a>judging</a> by its <a>merge commit</a>.`, 1);

function Closing_remarks($$anchor, $$props) {
	push($$props, true);

	const tagName = prop($$props, 'tagName', 7),
		postMerge = prop($$props, 'postMerge', 7, false),
		mergeCommit = prop($$props, 'mergeCommit', 7);

	const explanationHref = 'https://github.com/refined-github/refined-github/wiki/Extended-feature-descriptions#closing-remarks';

	function createReleaseUrl() {
		return isRefinedGitHubRepo()
			? 'https://github.com/refined-github/refined-github/actions/workflows/release.yml'
			: buildRepoUrl('releases/new');
	}

	var $$exports = {
		get tagName() {
			return tagName();
		},

		set tagName($$value) {
			tagName($$value);
			flushSync();
		},

		get postMerge() {
			return postMerge();
		},

		set postMerge($$value = false) {
			postMerge($$value);
			flushSync();
		},

		get mergeCommit() {
			return mergeCommit();
		},

		set mergeCommit($$value) {
			mergeCommit($$value);
			flushSync();
		}
	};

	var fragment = comment();
	var node = first_child(fragment);

	{
		var consequent = ($$anchor) => {
			Timeline_item($$anchor, {
				children: ($$anchor, $$slotProps) => {
					{
						const text = ($$anchor) => {
							next();

							var fragment_3 = root();
							var a = sibling(first_child(fragment_3));

							set_attribute(a, 'href', explanationHref);

							var a_1 = sibling(a, 2);
							var text_1 = child(a_1, true);

							reset(a_1);

							template_effect(
								($0) => {
									set_attribute(a_1, 'href', $0);
									set_text(text_1, tagName());
								},
								[() => buildRepoUrl('releases/tag', tagName())]
							);

							append($$anchor, fragment_3);
						};

						Banner($$anchor, {
							classes: ['flash-success', 'rgh-bg-none'],
							get icon() {
								return TagIcon;
							},
							text,
							$$slots: { text: true }
						});
					}
				},
				$$slots: { default: true }
			});
		};

		var alternate_1 = ($$anchor) => {
			var fragment_4 = comment();
			var node_1 = first_child(fragment_4);

			await_block(node_1, doesRepoHaveAnyTags, null, ($$anchor, hasAnyTags) => {
				var fragment_5 = comment();
				var node_2 = first_child(fragment_5);

				{
					var consequent_3 = ($$anchor) => {
						Timeline_item($$anchor, {
							children: ($$anchor, $$slotProps) => {
								{
									const text$1 = ($$anchor) => {
										var fragment_8 = comment();
										var node_3 = first_child(fragment_8);

										{
											var consequent_1 = ($$anchor) => {
												var text_2 = text('Now you can release this change');

												append($$anchor, text_2);
											};

											var alternate = ($$anchor) => {
												var fragment_9 = root_1();
												var a_2 = sibling(first_child(fragment_9));

												set_attribute(a_2, 'href', explanationHref);

												var a_3 = sibling(a_2, 2);

												next();
												template_effect(($0) => set_attribute(a_3, 'href', $0), [() => buildRepoUrl('commit', mergeCommit())]);
												append($$anchor, fragment_9);
											};

											if_block(node_3, ($$render) => {
												if (postMerge()) $$render(consequent_1); else $$render(alternate, -1);
											});
										}

										append($$anchor, fragment_8);
									};

									Banner($$anchor, {
										classes: ['rgh-bg-none'],
										get icon() {
											return TagIcon;
										},
										text: text$1,
										children: ($$anchor, $$slotProps) => {
											var fragment_10 = comment();
											var node_4 = first_child(fragment_10);

											await_block(node_4, userHasPushAccess, null, ($$anchor, hasPushAccess) => {
												var fragment_11 = comment();
												var node_5 = first_child(fragment_11);

												{
													var consequent_2 = ($$anchor) => {
														{
															let $0 = user_derived(createReleaseUrl);

															Banner_action($$anchor, {
																get action() {
																	return get($0);
																},

																children: ($$anchor, $$slotProps) => {
																	next();

																	var text_3 = text('Draft a new release');

																	append($$anchor, text_3);
																},
																$$slots: { default: true }
															});
														}
													};

													if_block(node_5, ($$render) => {
														if (get(hasPushAccess)) $$render(consequent_2);
													});
												}

												append($$anchor, fragment_11);
											});

											append($$anchor, fragment_10);
										},
										$$slots: { text: true, default: true }
									});
								}
							},
							$$slots: { default: true }
						});
					};

					if_block(node_2, ($$render) => {
						if (get(hasAnyTags)) $$render(consequent_3);
					});
				}

				append($$anchor, fragment_5);
			});

			append($$anchor, fragment_4);
		};

		if_block(node, ($$render) => {
			if (tagName()) $$render(consequent); else $$render(alternate_1, -1);
		});
	}

	append($$anchor, fragment);

	return pop($$exports);
}

create_custom_element(Closing_remarks, { tagName: {}, postMerge: {}, mergeCommit: {} }, [], [], { mode: 'open' });

export { Closing_remarks as default };
