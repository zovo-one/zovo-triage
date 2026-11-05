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
import { child, sibling } from '../npm/ztg-svelte-internal-client-dom-operations.js';
import { user_derived } from '../npm/ztg-svelte-internal-client-reactivity-deriveds.js';
import { if_block } from '../npm/ztg-svelte-internal-client-dom-blocks-if.js';
import { each } from '../npm/ztg-svelte-internal-client-dom-blocks-each.js';
import { set_custom_element_data, set_attribute } from '../npm/ztg-svelte-internal-client-dom-elements-attributes.js';
import { set_class } from '../npm/ztg-svelte-internal-client-dom-elements-class.js';
import { delegate, delegated } from '../npm/ztg-svelte-internal-client-dom-elements-events.js';
import { prop } from '../npm/ztg-svelte-internal-client-reactivity-props.js';
import { setup_stores, store_get } from '../npm/ztg-svelte-internal-client-reactivity-store.js';
import { create_custom_element } from '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import CheckIcon from '../npm/ztg-octicons-plain-react-components-Check.js';
import EyeIcon from '../npm/ztg-octicons-plain-react-components-Eye.js';
import EyeClosedIcon from '../npm/ztg-octicons-plain-react-components-EyeClosed.js';
import TriangleDownIcon from '../npm/ztg-octicons-plain-react-components-TriangleDown.js';
import Dom_chef from '../components/ztg-dom-chef.svelte.js';
import { states, activityFilterState } from '../helpers/ztg-conversation-activity-filter.js';
import { isSmallDevice } from '../helpers/ztg-dom-utils.js';

var root = from_html(`<li data-targets="action-list.items" role="none" class="ActionListItem"><button type="button" role="menuitemradio" class="ActionListContent"><span class="ActionListItem-visual ActionListItem-action--leading"><!></span> <span class="ActionListItem-label"> </span></button></li>`);
var root_1 = from_html(`<div class="Overlay-footer Overlay-footer--divided py-2 tmp-py-2"><span class="color-fg-muted">Press <kbd>h</kbd> to cycle through filters, <br/> even when the dropdown is closed</span></div>`);
var root_2 = from_html(`<action-menu><focus-group><button aria-haspopup="true" type="button" class="Button--small Button color-fg-muted Button Button--invisible"><span class="Button-content"><span><!></span> <span class="Button-label lh-condensed-ultra"><span class="v-align-text-top color-fg-danger">events</span></span> <span class="Button-visual Button-trailingVisual"><!></span></span></button> <anchored-position><div class="Overlay Overlay--size-small-portrait"><div class="Overlay-body Overlay-body--paddingNone"><action-list><ul role="menu" class="ActionListWrap--inset ActionListWrap"></ul></action-list></div> <!></div></anchored-position></focus-group></action-menu>`, 2);

function Conversation_activity_filter($$anchor, $$props) {
	push($$props, true);

	const $activityFilterState = () => store_get(activityFilterState, '$activityFilterState', $$stores);
	const [$$stores, $$cleanup] = setup_stores();
	const withMargin = prop($$props, 'withMargin', 7, false);
	const baseId = crypto.randomUUID();

	function selectState(targetState) {
		activityFilterState.set(targetState);
	}

	var $$exports = {
		get withMargin() {
			return withMargin();
		},

		set withMargin($$value = false) {
			withMargin($$value);
			flushSync();
		}
	};

	var action_menu = root_2();

	set_custom_element_data(action_menu, 'data-select-variant', 'single');

	var focus_group = child(action_menu);

	set_custom_element_data(focus_group, 'direction', 'vertical');
	set_custom_element_data(focus_group, 'mnemonics', true);
	set_custom_element_data(focus_group, 'retain', true);

	var button = child(focus_group);
	var span = child(button);
	var span_1 = child(span);
	let classes;
	var node = child(span_1);

	{
		var consequent = ($$anchor) => {
			Dom_chef($$anchor, {
				get as() {
					return EyeClosedIcon;
				},
				class: 'color-fg-danger'
			});
		};

		var alternate = ($$anchor) => {
			Dom_chef($$anchor, {
				get as() {
					return EyeIcon;
				}
			});
		};

		if_block(node, ($$render) => {
			if ($activityFilterState() !== 'showAll') $$render(consequent); else $$render(alternate, -1);
		});
	}

	reset(span_1);

	var span_2 = sibling(span_1, 2);
	var span_3 = child(span_2);

	reset(span_2);

	var span_4 = sibling(span_2, 2);
	var node_1 = child(span_4);

	Dom_chef(node_1, {
		get as() {
			return TriangleDownIcon;
		}
	});

	reset(span_4);
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

	each(ul, 21, () => Object.entries(states), ([itemState, label]) => itemState, ($$anchor, $$item) => {
		var $$array = user_derived(() => to_array(get($$item), 2));
		let itemState = () => get($$array)[0];
		let label = () => get($$array)[1];
		var li = root();
		var button_1 = child(li);

		set_attribute(button_1, 'id', `item-${crypto.randomUUID()}`);

		var span_5 = child(button_1);
		var node_2 = child(span_5);

		Dom_chef(node_2, {
			get as() {
				return CheckIcon;
			},
			class: 'ActionListItem-singleSelectCheckmark'
		});

		reset(span_5);

		var span_6 = sibling(span_5, 2);
		var text = child(span_6, true);

		reset(span_6);
		reset(button_1);
		reset(li);

		template_effect(() => {
			set_attribute(button_1, 'data-state', itemState());
			set_attribute(button_1, 'aria-checked', itemState() === $activityFilterState());
			set_text(text, label());
		});

		delegated('click', button_1, () => selectState(itemState()));
		append($$anchor, li);
	});

	reset(ul);
	reset(action_list);
	reset(div_1);

	var node_3 = sibling(div_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_2 = root_1();

			append($$anchor, div_2);
		};

		var d = user_derived(() => !isSmallDevice());

		if_block(node_3, ($$render) => {
			if (get(d)) $$render(consequent_1);
		});
	}

	reset(div);
	reset(anchored_position);
	reset(focus_group);
	reset(action_menu);

	template_effect(() => {
		set_class(action_menu, 1, `d-inline-block position-relative lh-condensed-ultra v-align-middle ${withMargin() ? 'ml-2' : ''}`);
		set_attribute(button, 'id', `${baseId}-button`);
		set_attribute(button, 'popovertarget', `${baseId}-overlay`);
		set_attribute(button, 'aria-controls', `${baseId}-list`);

		classes = set_class(span_1, 1, 'Button-visual Button-leadingVisual', null, classes, {
			'mr-0': $activityFilterState() === 'showAll' || $activityFilterState() === 'hideAllNoise'
		});

		set_attribute(span_3, 'hidden', $activityFilterState() !== 'hideEvents');
		set_attribute(ul, 'id', `${baseId}-list`);
		set_attribute(ul, 'aria-labelledby', `${baseId}-button`);
	});

	append($$anchor, action_menu);

	var $$pop = pop($$exports);

	$$cleanup();

	return $$pop;
}

delegate(['click']);
create_custom_element(Conversation_activity_filter, { withMargin: {} }, [], [], { mode: 'open' });

export { Conversation_activity_filter as default };
