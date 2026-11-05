import '../npm/ztg-svelte-internal-disclose-version.js';
import { get } from '../npm/ztg-svelte-internal-client-runtime.js';
import { push, pop } from '../npm/ztg-svelte-internal-client-context.js';
import { flushSync } from '../npm/ztg-svelte-internal-client-reactivity-batch.js';
import { next } from '../npm/ztg-svelte-internal-client-dom-hydration.js';
import { set_text } from '../npm/ztg-svelte-internal-client-render.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { template_effect } from '../npm/ztg-svelte-internal-client-reactivity-effects.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import { from_html, comment, append, text } from '../npm/ztg-svelte-internal-client-dom-template.js';
import { first_child, sibling } from '../npm/ztg-svelte-internal-client-dom-operations.js';
import { user_derived } from '../npm/ztg-svelte-internal-client-reactivity-deriveds.js';
import { await_block } from '../npm/ztg-svelte-internal-client-dom-blocks-await.js';
import { if_block } from '../npm/ztg-svelte-internal-client-dom-blocks-if.js';
import { prop } from '../npm/ztg-svelte-internal-client-reactivity-props.js';
import { create_custom_element } from '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import AlertIcon from '../npm/ztg-octicons-plain-react-components-Alert.js';
import InfoIcon from '../npm/ztg-octicons-plain-react-components-Info.js';
import { brokenFeatures } from '../helpers/ztg-hotfix.js';
import openOptions from '../helpers/ztg-open-options.js';
import { createRghIssueLink } from '../helpers/ztg-rgh-links.js';
import optionsStorage, { isFeatureDisabled } from '../ztg-options-storage.js';
import Banner_action from './ztg-banner-action.svelte.js';
import Banner from './ztg-banner.svelte.js';
import Dom_chef from './ztg-dom-chef.svelte.js';

var root = from_html(` <!>.`, 1);
var root_1 = from_html(`This feature is disabled due to <!>.`, 1);

function Disabled_feature_banner($$anchor, $$props) {
	push($$props, true);

	// eslint-disable-next-line no-undef -- Global type
	const id = prop($$props, 'id', 7);

	// eslint-disable-next-line no-undef -- Global type
	async function getDisabledState(featureId) {
		const hotfixes = await brokenFeatures.get() ?? [];
		const hotfixed = hotfixes.find(([feature]) => feature === featureId);

		if (hotfixed) {
			const [_name, issue, unaffectedVersion] = hotfixed;

			return unaffectedVersion
				? { kind: 'hotfixed-temporary', issue, unaffectedVersion }
				: { kind: 'hotfixed-permanent', issue };
		}

		if (isFeatureDisabled(await optionsStorage.getAll(), featureId)) {
			return { kind: 'user-disabled' };
		}

		return { kind: 'enabled' };
	}

	const disabledState = user_derived(() => getDisabledState(id()));
	const bannerClasses = ['mb-3', 'd-inline-block', 'width-full'];

	var $$exports = {
		get id() {
			return id();
		},

		set id($$value) {
			id($$value);
			flushSync();
		}
	};

	var fragment = comment();
	var node = first_child(fragment);

	await_block(node, () => get(disabledState), null, ($$anchor, state) => {
		var fragment_1 = comment();
		var node_1 = first_child(fragment_1);

		{
			var consequent = ($$anchor) => {
				{
					const text = ($$anchor) => {
						next();

						var fragment_3 = root();
						var text_1 = first_child(fragment_3);
						var node_2 = sibling(text_1);

						Dom_chef(node_2, { as: () => createRghIssueLink(get(state).issue) });
						next();
						template_effect(() => set_text(text_1, `This feature was disabled until version ${get(state).unaffectedVersion ?? ''} due to `));
						append($$anchor, fragment_3);
					};

					Banner($$anchor, {
						get classes() {
							return bannerClasses;
						},

						get icon() {
							return InfoIcon;
						},
						text,
						$$slots: { text: true }
					});
				}
			};

			var consequent_1 = ($$anchor) => {
				{
					const text = ($$anchor) => {
						next();

						var fragment_5 = root_1();
						var node_3 = sibling(first_child(fragment_5));

						Dom_chef(node_3, { as: () => createRghIssueLink(get(state).issue) });
						next();
						append($$anchor, fragment_5);
					};

					let $0 = user_derived(() => [...bannerClasses, 'flash-warn']);

					Banner($$anchor, {
						get classes() {
							return get($0);
						},

						get icon() {
							return AlertIcon;
						},
						text,
						$$slots: { text: true }
					});
				}
			};

			var consequent_2 = ($$anchor) => {
				{
					const text$1 = ($$anchor) => {
						next();

						var text_2 = text('You disabled this feature on GitHub.com.');

						append($$anchor, text_2);
					};

					let $0 = user_derived(() => [...bannerClasses, 'flash-warn']);

					Banner($$anchor, {
						get classes() {
							return get($0);
						},

						get icon() {
							return AlertIcon;
						},
						text: text$1,
						children: ($$anchor, $$slotProps) => {
							Banner_action($$anchor, {
								action: (event) => openOptions(event, id()),
								children: ($$anchor, $$slotProps) => {
									next();

									var text_3 = text('Refined GitHub Options');

									append($$anchor, text_3);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { text: true, default: true }
					});
				}
			};

			if_block(node_1, ($$render) => {
				if (get(state).kind === 'hotfixed-temporary') $$render(consequent); else if (get(state).kind === 'hotfixed-permanent') $$render(consequent_1, 1); else if (get(state).kind === 'user-disabled') $$render(consequent_2, 2);
			});
		}

		append($$anchor, fragment_1);
	});

	append($$anchor, fragment);

	return pop($$exports);
}

create_custom_element(Disabled_feature_banner, { id: {} }, [], [], { mode: 'open' });

export { Disabled_feature_banner as default };
