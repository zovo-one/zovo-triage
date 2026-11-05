import '../npm/ztg-svelte-internal-disclose-version.js';
import { get } from '../npm/ztg-svelte-internal-client-runtime.js';
import { noop } from '../npm/ztg-svelte-internal-shared-utils.js';
import { push, pop } from '../npm/ztg-svelte-internal-client-context.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { first_child, child, sibling } from '../npm/ztg-svelte-internal-client-dom-operations.js';
import { template_effect } from '../npm/ztg-svelte-internal-client-reactivity-effects.js';
import { user_derived } from '../npm/ztg-svelte-internal-client-reactivity-deriveds.js';
import { store_get, setup_stores } from '../npm/ztg-svelte-internal-client-reactivity-store.js';
import { reset } from '../npm/ztg-svelte-internal-client-dom-hydration.js';
import { set_text } from '../npm/ztg-svelte-internal-client-render.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import { from_html, comment, append, text } from '../npm/ztg-svelte-internal-client-dom-template.js';
import { if_block } from '../npm/ztg-svelte-internal-client-dom-blocks-if.js';
import { each } from '../npm/ztg-svelte-internal-client-dom-blocks-each.js';
import { html } from '../npm/ztg-svelte-internal-client-dom-blocks-html.js';
import { append_styles } from '../npm/ztg-svelte-internal-client-dom-css.js';
import { set_custom_element_data, set_attribute } from '../npm/ztg-svelte-internal-client-dom-elements-attributes.js';
import { set_class } from '../npm/ztg-svelte-internal-client-dom-elements-class.js';
import { set_style } from '../npm/ztg-svelte-internal-client-dom-elements-style.js';
import { create_custom_element } from '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import { isNewIssue } from '../npm/ztg-github-url-detection.js';
import CopyIcon from '../npm/ztg-octicons-plain-react-components-Copy.js';
import Disabled_feature_banner from '../components/ztg-disabled-feature-banner.svelte.js';
import Dom_chef from '../components/ztg-dom-chef.svelte.js';
import Related_issues_count from '../components/ztg-related-issues-count.svelte.js';
import urlStore from '../components/ztg-url.js';
import { getNewFeatureName, featuresMeta, getOldFeatureNames } from '../ztg-feature-data.js';
import { buildRepoUrl } from '../github-helpers/ztg-index.js';
import { isFeaturePrivate } from '../helpers/ztg-feature-utils.js';

const featureLink = ($$anchor, href = noop, label = noop) => {
	var a = root();
	var text = child(a, true);

	reset(a);

	template_effect(() => {
		set_attribute(a, 'href', href());
		set_text(text, label());
	});

	append($$anchor, a);
};

var root = from_html(`<a data-turbo-frame="repo-content-turbo-frame"> </a>`);
var root_1 = from_html(`<code> </code> <clipboard-copy><!></clipboard-copy>`, 3);
var root_2 = from_html(`<span class="color-fg-muted">This feature is no longer part of Refined GitHub.</span>`);
var root_3 = from_html(`<!><code> </code>`, 1);
var root_4 = from_html(`<div class="color-fg-muted mt-n3 tmp-mt-n3"><span class="text-small">previously named</span> <!></div>`);
var root_5 = from_html(`<div class="h3"></div>`);
var root_6 = from_html(`• <!>`, 1);
var root_7 = from_html(`<a class="flex-self-center"><img class="d-block border" alt=""/></a>`);
var root_8 = from_html(`<div class="Box mb-3 tmp-mb-3 d-inline-block width-full rgh-feature-description svelte-3epab8"><div class="Box-row d-flex gap-3 flex-wrap"><div class="rgh-feature-description d-flex flex-column gap-2 svelte-3epab8"><h3><!></h3> <!> <!> <div class="no-wrap"><!> <!> <!> <!></div></div> <!></div></div> <!>`, 1);

const $$css = {
	hash: 'svelte-3epab8',
	code: '.rgh-feature-description.svelte-3epab8 {flex-basis:300px !important;flex-grow:1;code, kbd {font-size:0.8em;line-height:0.8;}}'
};

function Rgh_feature_descriptions($$anchor, $$props) {
	push($$props, true);
	append_styles($$anchor, $$css);

	const $urlStore = () => store_get(urlStore, '$urlStore', $$stores);
	const [$$stores, $$cleanup] = setup_stores();
	const isReportingBug = isNewIssue();

	const idFromUrl = user_derived(() => {
		if (isReportingBug) {
			const title = new URL($urlStore()).searchParams.get('title') ?? '';

			return (/^`(?<id>[^`]+)`/).exec(title)?.groups?.id ?? undefined;
		}

		return (/\/(?<id>[^/]+)\.(?:tsx|css)$/).exec(new URL($urlStore()).pathname)?.groups?.id ?? undefined;

		// eslint-disable-next-line no-undef -- Global type
	});

	const id = user_derived(() => {
		const latestId = get(idFromUrl)
			? getNewFeatureName(get(idFromUrl)) ?? get(idFromUrl)
			: undefined;

		const meta = featuresMeta.find((f) => f.id === latestId);

		return meta?.id ?? latestId;
	});

	const meta = user_derived(() => featuresMeta.find((f) => f.id === get(id)));
	const wasFeatureRemoved = user_derived(() => !get(meta) && get(id) && !isFeaturePrivate(get(id)));

	const pathname = user_derived(() => isReportingBug
		? // Use .css so that it links to the .tsx file
		buildRepoUrl('blob', 'main', 'source', 'features', `${get(id)}.css`)
		: new URL($urlStore()).pathname);

	const isCss = user_derived(() => get(pathname).endsWith('.css'));

	const description = user_derived(() => get(meta)
		? get(meta).description + (get(meta).cssOnly
			? ' This feature is CSS-only and cannot be disabled.'
			: '')
		: get(id) && isFeaturePrivate(get(id))
			? 'This feature applies only to "Refined GitHub" repositories and cannot be disabled.'
			: undefined);

	const oldNames = user_derived(() => get(id) ? getOldFeatureNames(get(id)) : []);

	const newIssueUrl = user_derived(() => {
		const url = new URL('https://github.com/refined-github/refined-github/issues/new');

		url.searchParams.set('template', '1_bug_report.yml');
		url.searchParams.set('title', `\`${get(id // Trailing double-space to avoid triggering datalist autocomplete
		)}\`  `);
		url.searchParams.set('labels', 'bug, help wanted');

		return url;
	});

	var fragment = comment();
	var node = first_child(fragment);

	{
		var consequent_10 = ($$anchor) => {
			var fragment_1 = root_8();
			var div = first_child(fragment_1);
			var div_1 = child(div);
			var div_2 = child(div_1);
			var h3 = child(div_2);
			var node_1 = child(h3);

			{
				var consequent = ($$anchor) => {
					var fragment_2 = root_1();
					var code = first_child(fragment_2);
					var text_1 = child(code, true);

					reset(code);

					var clipboard_copy = sibling(code, 2);

					set_custom_element_data(clipboard_copy, 'aria-label', 'Copy');
					set_custom_element_data(clipboard_copy, 'data-copy-feedback', 'Copied!');
					template_effect(() => set_custom_element_data(clipboard_copy, 'value', get(id)));
					set_class(clipboard_copy, 1, 'Link--onHover color-fg-muted d-inline-block ml-2');
					set_custom_element_data(clipboard_copy, 'tabindex', '0');
					set_custom_element_data(clipboard_copy, 'role', 'button');

					var node_2 = child(clipboard_copy);

					Dom_chef(node_2, {
						get as() {
							return CopyIcon;
						},
						class: 'v-align-baseline'
					});

					reset(clipboard_copy);
					template_effect(() => set_text(text_1, get(id)));
					append($$anchor, fragment_2);
				};

				var alternate = ($$anchor) => {
					var span = root_2();

					append($$anchor, span);
				};

				if_block(node_1, ($$render) => {
					if (get(description)) $$render(consequent); else $$render(alternate, -1);
				});
			}

			reset(h3);

			var node_3 = sibling(h3, 2);

			{
				var consequent_2 = ($$anchor) => {
					var div_3 = root_4();
					var node_4 = sibling(child(div_3), 2);

					each(node_4, 18, () => get(oldNames), (name) => name, ($$anchor, name, index) => {
						var fragment_3 = root_3();
						var node_5 = first_child(fragment_3);

						{
							var consequent_1 = ($$anchor) => {
								var text_2 = text(',');

								append($$anchor, text_2);
							};

							if_block(node_5, ($$render) => {
								if (get(index) > 0) $$render(consequent_1);
							});
						}

						var code_1 = sibling(node_5);
						var text_3 = child(code_1, true);

						reset(code_1);
						template_effect(() => set_text(text_3, name));
						append($$anchor, fragment_3);
					});

					reset(div_3);
					append($$anchor, div_3);
				};

				if_block(node_3, ($$render) => {
					if (get(oldNames).length > 0) $$render(consequent_2);
				});
			}

			var node_6 = sibling(node_3, 2);

			{
				var consequent_3 = ($$anchor) => {
					var div_4 = root_5();

					html(div_4, () => get(description), true);
					reset(div_4);
					append($$anchor, div_4);
				};

				if_block(node_6, ($$render) => {
					if (get(description)) $$render(consequent_3);
				});
			}

			var div_5 = sibling(node_6, 2);
			var node_7 = child(div_5);

			Related_issues_count(node_7, {
				get featureId() {
					return get(id);
				}
			});

			var node_8 = sibling(node_7, 2);

			{
				var consequent_4 = ($$anchor) => {
					var fragment_4 = root_6();
					var node_9 = sibling(first_child(fragment_4));

					featureLink(node_9, () => get(newIssueUrl).href, () => 'Report bug');
					append($$anchor, fragment_4);
				};

				if_block(node_8, ($$render) => {
					if (!get(wasFeatureRemoved) && !isReportingBug) $$render(consequent_4);
				});
			}

			var node_10 = sibling(node_8, 2);

			{
				var consequent_7 = ($$anchor) => {
					var fragment_5 = comment();
					var node_11 = first_child(fragment_5);

					{
						var consequent_5 = ($$anchor) => {
							var fragment_6 = root_6();
							var node_12 = sibling(first_child(fragment_6));

							{
								let $0 = user_derived(() => get(pathname).replace('.css', '.tsx'));

								featureLink(node_12, () => get($0), () => 'See .tsx file');
							}

							append($$anchor, fragment_6);
						};

						var consequent_6 = ($$anchor) => {
							var fragment_7 = root_6();
							var node_13 = sibling(first_child(fragment_7));

							{
								let $0 = user_derived(() => get(pathname).replace('.tsx', '.css'));

								featureLink(node_13, () => get($0), () => 'See .css file');
							}

							append($$anchor, fragment_7);
						};

						if_block(node_11, ($$render) => {
							if (get(isCss) && !get(meta).cssOnly) $$render(consequent_5); else if (get(meta).css && !get(isCss)) $$render(consequent_6, 1);
						});
					}

					append($$anchor, fragment_5);
				};

				if_block(node_10, ($$render) => {
					if (get(meta)) $$render(consequent_7);
				});
			}

			var node_14 = sibling(node_10, 2);

			{
				var consequent_8 = ($$anchor) => {
					var fragment_8 = root_6();
					var node_15 = sibling(first_child(fragment_8));

					featureLink(node_15, () => `https://github.com/refined-github/refined-github/commits/main/source/features/${get(id)}.tsx`, () => 'Commit history');
					append($$anchor, fragment_8);
				};

				if_block(node_14, ($$render) => {
					if (get(wasFeatureRemoved)) $$render(consequent_8);
				});
			}

			reset(div_5);
			reset(div_2);

			var node_16 = sibling(div_2, 2);

			{
				var consequent_9 = ($$anchor) => {
					var a_1 = root_7();
					var img = child(a_1);

					set_style(img, '', {}, { 'max-height': '100px', 'max-width': '150px' });
					reset(a_1);

					template_effect(() => {
						set_attribute(a_1, 'href', get(meta).screenshot);
						set_attribute(img, 'src', get(meta).screenshot);
					});

					append($$anchor, a_1);
				};

				if_block(node_16, ($$render) => {
					if (get(meta)?.screenshot) $$render(consequent_9);
				});
			}

			reset(div_1);
			reset(div);

			var node_17 = sibling(div, 2);

			Disabled_feature_banner(node_17, {
				get id() {
					return get(id);
				}
			});

			append($$anchor, fragment_1);
		};

		if_block(node, ($$render) => {
			if (get(id)) $$render(consequent_10);
		});
	}

	append($$anchor, fragment);
	pop();
	$$cleanup();
}

create_custom_element(Rgh_feature_descriptions, {}, [], [], { mode: 'open' });

export { Rgh_feature_descriptions as default };
