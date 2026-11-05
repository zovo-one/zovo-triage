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
import { if_block } from '../npm/ztg-svelte-internal-client-dom-blocks-if.js';
import { set_attribute, set_custom_element_data, remove_input_defaults, set_value } from '../npm/ztg-svelte-internal-client-dom-elements-attributes.js';
import { set_class } from '../npm/ztg-svelte-internal-client-dom-elements-class.js';
import { set_style } from '../npm/ztg-svelte-internal-client-dom-elements-style.js';
import { prop } from '../npm/ztg-svelte-internal-client-reactivity-props.js';
import { create_custom_element } from '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import RepoForkedIcon from '../npm/ztg-octicons-plain-react-components-RepoForked.js';
import StarIcon from '../npm/ztg-octicons-plain-react-components-Star.js';
import StarFillIcon from '../npm/ztg-octicons-plain-react-components-StarFill.js';
import Dom_chef from '../components/ztg-dom-chef.svelte.js';
import { buildRepoUrl } from '../github-helpers/ztg-index.js';
import abbreviateNumber from '../helpers/ztg-abbreviate-number.js';

var root = from_html(`<a class="d-flex flex-items-center flex-justify-center p-1 tmp-p-1 Button Button--invisible"><!></a>`);
var root_1 = from_html(`<a><!> <span class="f5"> </span></a>`);
var root_2 = from_html(`<span class="rgh-ci-link d-flex flex-items-center flex-justify-center p-1 tmp-p-1 Button Button--invisible" title="CI status of latest commit"><batch-deferred-content><input name="oid" data-targets="batch-deferred-content.inputs"/></batch-deferred-content></span>`, 2);
var root_3 = from_html(`<li class="d-none d-md-flex rgh-header-info"><!> <!> <!></li>`);

function Repo_header_info($$anchor, $$props) {
	push($$props, true);

	const info = prop($$props, 'info', 7);

	var $$exports = {
		get info() {
			return info();
		},

		set info($$value) {
			info($$value);
			flushSync();
		}
	};

	var li = root_3();

	set_style(li, '', {}, { order: '10' });

	var node = child(li);

	{
		var consequent = ($$anchor) => {
			var a = root();
			var node_1 = child(a);

			Dom_chef(node_1, {
				get as() {
					return RepoForkedIcon;
				},
				class: 'm-0 tmp-m-0',
				width: 12,
				height: 12
			});

			reset(a);
			template_effect(() => set_attribute(a, 'href', info().forked.url));
			append($$anchor, a);
		};

		if_block(node, ($$render) => {
			if (info().forked) $$render(consequent);
		});
	}

	var node_2 = sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var a_1 = root_1();
			var node_3 = child(a_1);

			{
				let $0 = user_derived(() => info().viewerHasStarred ? StarFillIcon : StarIcon);
				let $1 = user_derived(() => info().viewerHasStarred ? 'var(--button-star-iconColor)' : undefined);

				Dom_chef(node_3, {
					get as() {
						return get($0);
					},
					width: 12,
					height: 12,
					get color() {
						return get($1);
					}
				});
			}

			var span = sibling(node_3, 2);
			var text = child(span, true);

			reset(span);
			reset(a_1);

			template_effect(
				($0, $1) => {
					set_attribute(a_1, 'href', info().stargazerUrl);
					set_attribute(a_1, 'title', $0);
					set_class(a_1, 1, `d-flex flex-items-center flex-justify-center gap-1 p-1 tmp-p-1 color-fg-muted ${info().stargazerUrl ? 'Button Button--invisible' : 'no-underline'}`);
					set_text(text, $1);
				},
				[
					() => `Repository starred by ${info().stargazerCount.toLocaleString('us')} people${info().viewerHasStarred ? ', including you' : ''}`,
					() => abbreviateNumber(info().stargazerCount)
				]
			);

			append($$anchor, a_1);
		};

		if_block(node_2, ($$render) => {
			if (info().stargazerCount > 1) $$render(consequent_1);
		});
	}

	var node_4 = sibling(node_2, 2);

	{
		var consequent_2 = ($$anchor) => {
			var span_1 = root_2();
			var batch_deferred_content = child(span_1);

			set_custom_element_data(batch_deferred_content, 'hidden', true);
			template_effect(() => set_custom_element_data(batch_deferred_content, 'data-url', buildRepoUrl('commits/checks-statuses-rollups')));

			var input = child(batch_deferred_content);

			remove_input_defaults(input);
			reset(batch_deferred_content);
			reset(span_1);
			template_effect(() => set_value(input, info().ciCommit));
			append($$anchor, span_1);
		};

		if_block(node_4, ($$render) => {
			if (info().ciCommit) $$render(consequent_2);
		});
	}

	reset(li);
	append($$anchor, li);

	return pop($$exports);
}

create_custom_element(Repo_header_info, { info: {} }, [], [], { mode: 'open' });

export { Repo_header_info as default };
