import elementReady from '../npm/ztg-element-ready.js';
import { isPR } from '../npm/ztg-github-url-detection.js';
import { $$ } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import { registerHotkey, overrideHotkey } from '../github-helpers/ztg-hotkey.js';
import { is } from '../helpers/ztg-css-selectors.js';

const tabnavSelectors = [
	'[aria-label="Pull request tabs"]',
	'[aria-label^="Pull request navigation"]',
] ;

function selectAdjacentTab(offset) {
	const tabs = $$(is(tabnavSelectors) + ' a');
	const selectedIndex = tabs.findIndex(tab => tab.matches('.selected, [aria-current]'));
	const adjacentIndex = (selectedIndex + offset + tabs.length) % tabs.length;
	tabs[adjacentIndex].click();
}

function selectPreviousTab() {
	selectAdjacentTab(-1);
}

function selectNextTab() {
	selectAdjacentTab(1);
}

async function init(signal) {
	registerHotkey('g ArrowLeft', selectPreviousTab, {signal});
	registerHotkey('g ArrowRight', selectNextTab, {signal});

	const tabnav = await elementReady(tabnavSelectors);
	const tabs = $$('a', tabnav);
	for (const [index, tab] of tabs.entries()) {
		// Reset previous hotkeys because the DOM persists across soft navigations
		overrideHotkey(tab, `g ${index + 1}`);
	}
}

void features.add(import.meta.url, {
	shortcuts: {
		'g <number>': 'Go to PR tab <number>',
		'g →': 'Go to next PR tab',
		'g ←': 'Go to previous PR tab',
	},
	include: [
		isPR,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/sandbox/pull/4

*/
