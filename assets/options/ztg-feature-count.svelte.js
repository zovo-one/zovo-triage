import '../npm/ztg-svelte-internal-disclose-version.js';
import { get } from '../npm/ztg-svelte-internal-client-runtime.js';
import { push, pop } from '../npm/ztg-svelte-internal-client-context.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { next } from '../npm/ztg-svelte-internal-client-dom-hydration.js';
import { state, set } from '../npm/ztg-svelte-internal-client-reactivity-sources.js';
import { user_effect, template_effect } from '../npm/ztg-svelte-internal-client-reactivity-effects.js';
import { user_derived } from '../npm/ztg-svelte-internal-client-reactivity-deriveds.js';
import { set_text } from '../npm/ztg-svelte-internal-client-render.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import { text, append } from '../npm/ztg-svelte-internal-client-dom-template.js';
import { create_custom_element } from '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import { featuresMeta } from '../ztg-feature-data.js';

function Feature_count($$anchor, $$props) {
	push($$props, true);

	let totalCount = state(0);
	let uncheckedCount = state(0);
	let isInitialized = state(false);
	const totalFeatures = featuresMeta.length + 25;

	function updateCount() {
		// eslint-disable-next-line select-dom/prefer -- Optional
		const checkboxes = document.querySelectorAll('input.feature-checkbox');

		set(totalCount, checkboxes.length, true);

		// Don't calculate if the features list hasn't finished rendering yet
		if (get(totalCount) === 0) {
			return;
		}

		set(uncheckedCount, [...checkboxes].filter((checkbox) => !checkbox.checked).length, true);
		set(isInitialized, true);
	}

	const offCountText = user_derived(() => {
		if (!get(isInitialized) || get(uncheckedCount) === 0) {
			return '';
		}

		if (get(uncheckedCount) === get(totalCount)) {
			return '(JS off… are you breaking up with me?)';
		}

		return `(${get(uncheckedCount)} off)`;
	});

	user_effect(() => {
		// Run initial check after component mounts
		updateCount();

		// Global delegation replacement for standard checkbox clicks
		const handleChange = (event) => {
			const target = event.target;

			if (target?.classList.contains('feature-checkbox')) {
				updateCount();
			}
		};

		// Listen to global state for now
		globalThis.addEventListener('change', handleChange);

		globalThis.addEventListener('rgh:update-count', updateCount);

		return () => {
			globalThis.removeEventListener('change', handleChange);
			globalThis.removeEventListener('rgh:update-count', updateCount);
		};
	});

	next();

	var text$1 = text();

	template_effect(() => set_text(text$1, `: ${totalFeatures} ${get(offCountText) ?? ''}`));
	append($$anchor, text$1);
	pop();
}

create_custom_element(Feature_count, {}, [], [], { mode: 'open' });

export { Feature_count as default };
