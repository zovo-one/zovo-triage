import '../npm/ztg-svelte-internal-disclose-version.js';
import { get } from '../npm/ztg-svelte-internal-client-runtime.js';
import { to_array } from '../npm/ztg-svelte-internal-shared-utils.js';
import { push, pop } from '../npm/ztg-svelte-internal-client-context.js';
import { flushSync } from '../npm/ztg-svelte-internal-client-reactivity-batch.js';
import { reset } from '../npm/ztg-svelte-internal-client-dom-hydration.js';
import { set_text } from '../npm/ztg-svelte-internal-client-render.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { template_effect } from '../npm/ztg-svelte-internal-client-reactivity-effects.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import { from_html, append } from '../npm/ztg-svelte-internal-client-dom-template.js';
import { sibling, first_child, child } from '../npm/ztg-svelte-internal-client-dom-operations.js';
import { state, set } from '../npm/ztg-svelte-internal-client-reactivity-sources.js';
import { user_derived } from '../npm/ztg-svelte-internal-client-reactivity-deriveds.js';
import { if_block } from '../npm/ztg-svelte-internal-client-dom-blocks-if.js';
import { each } from '../npm/ztg-svelte-internal-client-dom-blocks-each.js';
import { set_custom_element_data, set_attribute } from '../npm/ztg-svelte-internal-client-dom-elements-attributes.js';
import { set_class } from '../npm/ztg-svelte-internal-client-dom-elements-class.js';
import { delegate, event, delegated } from '../npm/ztg-svelte-internal-client-dom-elements-events.js';
import { proxy } from '../npm/ztg-svelte-internal-client-proxy.js';
import { prop } from '../npm/ztg-svelte-internal-client-reactivity-props.js';
import { create_custom_element } from '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import CheckIcon from '../npm/ztg-octicons-plain-react-components-Check.js';
import CheckCircleIcon from '../npm/ztg-octicons-plain-react-components-CheckCircle.js';
import DotIcon from '../npm/ztg-octicons-plain-react-components-Dot.js';
import DotFillIcon from '../npm/ztg-octicons-plain-react-components-DotFill.js';
import GitMergeIcon from '../npm/ztg-octicons-plain-react-components-GitMerge.js';
import GitPullRequestIcon from '../npm/ztg-octicons-plain-react-components-GitPullRequest.js';
import GitPullRequestDraftIcon from '../npm/ztg-octicons-plain-react-components-GitPullRequestDraft.js';
import HubotIcon from '../npm/ztg-octicons-plain-react-components-Hubot.js';
import IssueOpenedIcon from '../npm/ztg-octicons-plain-react-components-IssueOpened.js';
import SquirrelIcon from '../npm/ztg-octicons-plain-react-components-Squirrel.js';
import TriangleDownIcon from '../npm/ztg-octicons-plain-react-components-TriangleDown.js';
import XCircleIcon from '../npm/ztg-octicons-plain-react-components-XCircle.js';
import Dom_chef from '../components/ztg-dom-chef.svelte.js';
import { isSmallDevice } from '../helpers/ztg-dom-utils.js';

var root = from_html(`<li data-targets="action-list.items" role="none" class="ActionListItem"><button type="button" role="menuitemcheckbox" class="ActionListContent"><span class="ActionListItem-visual ActionListItem-action--leading"><!></span> <span class="ActionListItem-label d-flex flex-items-center gap-2"><!> </span></button></li>`);
var root_1 = from_html(`<li role="none" class="ActionList-sectionDivider"><h3 class="ActionList-sectionDivider-title"> </h3></li> <!>`, 1);
var root_2 = from_html(`<div class="Overlay-footer Overlay-footer--divided py-2 tmp-py-2"><span class="color-fg-muted">You can press <kbd>Shift</kbd> + <kbd>S</kbd> to open this menu.</span></div>`);
var root_3 = from_html(`<span class="ml-2 tmp-ml-2">·</span> <action-menu><focus-group><button aria-haspopup="true" data-hotkey="Shift+S" type="button" class="Button--small Button"><span class="Button-content"><span class="Button-label">Select by</span> <span class="Button-visual Button-trailingVisual"><!></span></span></button> <anchored-position><div class="Overlay"><div class="Overlay-body Overlay-body--paddingNone"><action-list><ul role="menu" class="ActionListWrap--inset ActionListWrap"></ul></action-list></div> <!></div></anchored-position></focus-group></action-menu>`, 3);

function Select_notifications($$anchor, $$props) {
	push($$props, true);

	const categories = prop($$props, 'categories', 7),
		onSelectionChange = prop($$props, 'onSelectionChange', 7);

	const baseId = crypto.randomUUID();

	const icons = {
		'Pull requests': GitPullRequestIcon,
		Issues: IssueOpenedIcon,
		Others: SquirrelIcon,
		Bots: HubotIcon,
		Open: CheckCircleIcon,
		Closed: XCircleIcon,
		Draft: GitPullRequestDraftIcon,
		Merged: GitMergeIcon,
		Read: DotIcon,
		Unread: DotFillIcon
	};

	const iconColors = {
		Open: 'color-fg-success',
		Closed: 'color-fg-danger',
		Draft: 'color-fg-subtle',
		Merged: 'color-fg-done',
		Read: 'color-fg-accent',
		Unread: 'color-fg-accent'
	};

	let selection = state(proxy({ Type: [], Status: [], Read: [] }));

	function isSelected(category, filter) {
		return get(selection)[category].includes(filter);
	}

	function toggle(category, filter) {
		get(selection)[category] = isSelected(category, filter)
			? get(selection)[category].filter((value) => value !== filter)
			: [...get(selection)[category], filter];

		onSelectionChange()({ ...get(selection) });
	}

	function reset$1() {
		set(selection, { Type: [], Status: [], Read: [] }, true);
	}

	var $$exports = {
		get categories() {
			return categories();
		},

		set categories($$value) {
			categories($$value);
			flushSync();
		},

		get onSelectionChange() {
			return onSelectionChange();
		},

		set onSelectionChange($$value) {
			onSelectionChange($$value);
			flushSync();
		}
	};

	var fragment = root_3();
	var action_menu = sibling(first_child(fragment), 2);

	set_class(action_menu, 1, 'rgh-select-notifications flex-shrink-0');
	set_custom_element_data(action_menu, 'data-select-variant', 'multiple');

	var focus_group = child(action_menu);

	set_custom_element_data(focus_group, 'direction', 'vertical');
	set_custom_element_data(focus_group, 'mnemonics', true);
	set_custom_element_data(focus_group, 'retain', true);

	var button = child(focus_group);
	var span = child(button);
	var span_1 = sibling(child(span), 2);
	var node = child(span_1);

	Dom_chef(node, {
		get as() {
			return TriangleDownIcon;
		}
	});

	reset(span_1);
	reset(span);
	reset(button);

	var anchored_position = sibling(button, 2);

	template_effect(() => set_custom_element_data(anchored_position, 'id', `${baseId}-overlay`));
	set_custom_element_data(anchored_position, 'data-target', 'action-menu.overlay');
	template_effect(() => set_custom_element_data(anchored_position, 'anchor', `${baseId}-button`));
	set_custom_element_data(anchored_position, 'align', 'start');
	set_custom_element_data(anchored_position, 'side', 'outside-bottom');
	set_custom_element_data(anchored_position, 'anchor-offset', 'normal');
	set_custom_element_data(anchored_position, 'popover', 'auto');

	var div = child(anchored_position);
	var div_1 = child(div);
	var action_list = child(div_1);
	var ul = child(action_list);

	each(ul, 21, () => Object.entries(categories()), ([category, categoryFilters]) => category, ($$anchor, $$item) => {
		var $$array = user_derived(() => to_array(get($$item), 2));
		let category = () => get($$array)[0];
		let categoryFilters = () => get($$array)[1];
		var fragment_1 = root_1();
		var li = first_child(fragment_1);
		var h3 = child(li);
		var text = child(h3, true);

		reset(h3);
		reset(li);

		var node_1 = sibling(li, 2);

		each(node_1, 16, categoryFilters, (filter) => filter, ($$anchor, filter) => {
			var li_1 = root();
			var button_1 = child(li_1);
			var span_2 = child(button_1);
			var node_2 = child(span_2);

			Dom_chef(node_2, {
				get as() {
					return CheckIcon;
				},
				class: 'ActionListItem-singleSelectCheckmark'
			});

			reset(span_2);

			var span_3 = sibling(span_2, 2);
			var node_3 = child(span_3);

			{
				let $0 = user_derived(() => iconColors[filter] ?? 'color-fg-muted');

				Dom_chef(node_3, {
					get as() {
						return icons[filter];
					},

					get class() {
						return get($0);
					}
				});
			}

			var text_1 = sibling(node_3);

			reset(span_3);
			reset(button_1);
			reset(li_1);

			template_effect(
				($0) => {
					set_attribute(button_1, 'aria-checked', $0);
					set_text(text_1, ` ${filter ?? ''}`);
				},
				[() => isSelected(category(), filter)]
			);

			delegated('click', button_1, () => {
				toggle(category(), filter);
			});

			append($$anchor, li_1);
		});

		template_effect(() => set_text(text, category()));
		append($$anchor, fragment_1);
	});

	reset(ul);
	reset(action_list);
	reset(div_1);

	var node_4 = sibling(div_1, 2);

	{
		var consequent = ($$anchor) => {
			var div_2 = root_2();

			append($$anchor, div_2);
		};

		var d = user_derived(() => !isSmallDevice());

		if_block(node_4, ($$render) => {
			if (get(d)) $$render(consequent);
		});
	}

	reset(div);
	reset(anchored_position);
	reset(focus_group);
	reset(action_menu);

	template_effect(() => {
		set_attribute(button, 'id', `${baseId}-button`);
		set_attribute(button, 'popovertarget', `${baseId}-overlay`);
		set_attribute(button, 'aria-controls', `${baseId}-list`);
		set_attribute(ul, 'id', `${baseId}-list`);
		set_attribute(ul, 'aria-labelledby', `${baseId}-button`);
	});

	event('toggle', anchored_position, reset$1);
	append($$anchor, fragment);

	return pop($$exports);
}

delegate(['click']);
create_custom_element(Select_notifications, { categories: {}, onSelectionChange: {} }, [], [], { mode: 'open' });

export { Select_notifications as default };
