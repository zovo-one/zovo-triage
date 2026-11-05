import { $ } from '../npm/ztg-select-dom.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { derived, writable, get } from '../npm/ztg-svelte-store-shared.js';

const nativeTabs = writable([]);
const extraTabs = writable([]);
const overrides = writable(new Map());

const selectedId = writable();

const tabs = derived(
	[nativeTabs, extraTabs, overrides],
	([$nativeTabs, $extraTabs, $overrides]) => {
		const tabs = $nativeTabs.map(tab => ({...tab, ...$overrides.get(tab.id)}));

		for (const {tab, before} of $extraTabs) {
			const index = before ? tabs.findIndex(({id}) => id === before) : -1;
			tabs.splice(index === -1 ? tabs.length : index, 0, tab);
		}

		const demoted = tabs.filter(tab => tab.demoted);
		const rest = tabs.filter(tab => !tab.demoted);

		return [...rest, ...demoted];
	},
);

function setNativeTabs(nativeTabsList) {
	nativeTabs.set(nativeTabsList);
}

function selectTab(id) {
	selectedId.set(id);
}

function addTab(tab, before) {
	extraTabs.update(current => [...current, {tab, before}]);

	// TODO: Should probably trigger `updateCurrentTab` reactively somehow, but this works for now
	if (tab.selected) {
		void (async () => {
			if (await tab.selected()) {
				selectTab(tab.id);
			}
		})();
	}
}

function overrideTab(id, override) {
	overrides.update(current => new Map(current).set(id, {...current.get(id), ...override}));
}

async function updateCurrentTab() {
	for (const {tab} of get(extraTabs)) {
		// eslint-disable-next-line no-await-in-loop -- Tabs must be tried in order, first match wins
		if (await tab.selected?.()) {
			selectTab(tab.id);
			return;
		}
	}

	const currentTab = $('nav[aria-label="Repository"] a[aria-current][data-tab-item]');
	selectTab(currentTab.getAttribute('data-tab-item'));
}

export { addTab, overrideTab, selectTab, selectedId, setNativeTabs, tabs, updateCurrentTab };
