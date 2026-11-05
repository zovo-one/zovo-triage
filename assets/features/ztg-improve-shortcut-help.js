import React from '../npm/ztg-dom-chef.js';
import memoize from '../npm/ztg-memoize.js';
import { $ } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import { upperCaseFirst } from '../github-helpers/ztg-index.js';
import { shortcutMap } from '../helpers/ztg-feature-helpers.js';
import joinJsx from '../helpers/ztg-join-jsx.js';
import observe from '../helpers/ztg-selector-observer.js';

const getRghShortcutsContainer = memoize(
	(baseShortcutsContainer) => {
		const rghShortcutsContainer = baseShortcutsContainer.cloneNode(true);
		const shortcutsList = $('ul', rghShortcutsContainer);
		const shortcutItem = $('[class^="ShortcutsGroupList-module__ShortcutItem"]', shortcutsList);
		const keybindingHint = $('kbd', shortcutItem);
		const chord = $('span', shortcutItem);

		$('h2', rghShortcutsContainer).textContent = 'Refined GitHub';
		shortcutsList.replaceChildren(
			...[...shortcutMap]
				.toSorted(([, a], [, b]) => a.localeCompare(b))
				.map(([hotkey, description]) => {
					const keys = hotkey.split(' ').map(key =>
						React.createElement('span', { className: chord.className,}
, upperCaseFirst(key)
),
					);
					const currentItem = shortcutItem.cloneNode(true);
					currentItem.firstElementChild.textContent = description;
					currentItem.lastElementChild.replaceChildren(
						React.createElement('kbd', { className: keybindingHint.className,}
, joinJsx(' ', keys)
),
					);
					return currentItem;
				}),
		);

		return rghShortcutsContainer;
	},
	{
		cacheKey: () => location.origin + location.pathname,
	},
);

function improveShortcutHelp(columnsContainer) {
	if (shortcutMap.size === 0) {
		features.unload(import.meta.url);
		return;
	}

	const lastColumn = columnsContainer.lastElementChild;
	lastColumn.append(getRghShortcutsContainer(lastColumn.firstElementChild));
}

function init(signal) {
	observe('div[class^="ShortcutsDialog"][class*="ColumnsContainer"]', improveShortcutHelp, {signal});
}

void features.add(import.meta.url, {
	init,
});

void features.addCssFeature(import.meta.url);

/*

Test URLs: Any page

*/
