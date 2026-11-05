import '../npm/ztg-svelte-internal-disclose-version.js';
import { onMount } from '../npm/ztg-svelte-index-client.js';
import { user_effect, template_effect } from '../npm/ztg-svelte-internal-client-reactivity-effects.js';
import { push, pop } from '../npm/ztg-svelte-internal-client-context.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { get } from '../npm/ztg-svelte-internal-client-runtime.js';
import { reset } from '../npm/ztg-svelte-internal-client-dom-hydration.js';
import { state, set } from '../npm/ztg-svelte-internal-client-reactivity-sources.js';
import { set_text } from '../npm/ztg-svelte-internal-client-render.js';
import { child } from '../npm/ztg-svelte-internal-client-dom-operations.js';
import { flushSync } from '../npm/ztg-svelte-internal-client-reactivity-batch.js';
import { user_derived } from '../npm/ztg-svelte-internal-client-reactivity-deriveds.js';
import { from_html, append } from '../npm/ztg-svelte-internal-client-dom-template.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import { prop } from '../npm/ztg-svelte-internal-client-reactivity-props.js';
import { create_custom_element } from '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import prettyBytes from '../npm/ztg-pretty-bytes.js';
import { getStoredItemSize, getStorageBytesInUse, getTrueSizeOfObject } from '../helpers/ztg-used-storage.js';

var root = from_html(`<output> </output>`);

function Storage_usage($$anchor, $$props) {
	push($$props, true);

	const area = prop($$props, 'area', 7),
		item = prop($$props, 'item', 7);

	let used = state(0);

	const available = user_derived(() => {
		const storage = chrome.storage[area()];

		return (item()
			? storage.QUOTA_BYTES_PER_ITEM ?? storage.QUOTA_BYTES
			: storage.QUOTA_BYTES) - get(used);
	});

	async function getStorageUsage() {
		set(
			used,
			item()
				? await getStoredItemSize(area(), item())
				: await getStorageBytesInUse(area()),
			true
		);
	}

	const handleStorageChange = (changes, areaName) => {
		if (item() && Object.hasOwn(changes, item())) {
			// @ts-expect-error Can't use `webext-storage` because the component also supports whole-storage size
			set(used, getTrueSizeOfObject(changes[item()].newValue), true);
		}

		if (areaName === area()) {
			getStorageUsage();
		}
	};

	user_effect(() => {
		getStorageUsage();
	});

	onMount(() => {
		chrome.storage.onChanged.addListener(handleStorageChange);

		return () => {
			chrome.storage.onChanged.removeListener(handleStorageChange);
		};
	});

	var $$exports = {
		get area() {
			return area();
		},

		set area($$value) {
			area($$value);
			flushSync();
		},

		get item() {
			return item();
		},

		set item($$value) {
			item($$value);
			flushSync();
		}
	};

	var output = root();
	var text = child(output, true);

	reset(output);

	template_effect(($0) => set_text(text, $0), [
		() => get(available) < 100_000
			? `Only ${prettyBytes(get(available))} available`
			: `${prettyBytes(get(used))} used`
	]);

	append($$anchor, output);

	return pop($$exports);
}

create_custom_element(Storage_usage, { area: {}, item: {} }, [], [], { mode: 'open' });

export { Storage_usage as default };
