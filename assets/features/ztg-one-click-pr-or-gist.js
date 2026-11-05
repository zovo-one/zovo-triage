import { clsx } from '../npm/ztg-clsx-clsx.js';
import React from '../npm/ztg-dom-chef.js';
import { isCompare, isGist } from '../npm/ztg-github-url-detection.js';
import { elementExists, $optional, $$, $ } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import { withTooltipRef } from '../components/ztg-tooltip.js';

function init() {
	const initialGroupedButtons = $optional('.BtnGroup:has([name="draft"], [name="gist[public]"])');
	if (!initialGroupedButtons) {
		// 1. Free accounts can't open Draft PRs in private repos, so this element is missing
		// 2. PRs can't be created from some comparison pages: Either base is a tag, not a branch; or there already exists a PR.
		return false;
	}

	const parent = initialGroupedButtons.parentElement;

	for (const dropdownItem of $$('.select-menu-item', initialGroupedButtons)) {
		let title = $('.select-menu-item-heading', dropdownItem).textContent.trim();
		const description = $('.description', dropdownItem).textContent.trim();
		const radioButton = $('input[type=radio]', dropdownItem);
		const classList = ['btn', 'ml-2'];

		if (/\bdraft\b/i.test(title)) {
			title = 'Create draft PR';
		} else {
			classList.push('btn-primary');
		}

		initialGroupedButtons.after(
			React.createElement('button', {
				ref: withTooltipRef(description),
				'data-disable-invalid': true,
				className: clsx(classList),
				type: "submit",
				name: radioButton.name,
				value: radioButton.value,}

, title
),
		);
	}

	initialGroupedButtons.remove();

	// Add minimal structure validation before adding a dangerous class
	if (parent.classList.contains('d-flex') && parent.parentElement.classList.contains('flex-justify-end')) {
		parent.parentElement.classList.add('flex-wrap');
	}
}

void features.add(import.meta.url, {
	include: [
		isCompare,
		isGist,
	],
	exclude: [
		() => elementExists('[data-show-dialog-id="drafts-upgrade-dialog"]'),
	],
	deduplicate: 'has-rgh',
	awaitDomReady: true,
	init,
});

/*

Test URLs

- Normal: https://github.com/refined-github/sandbox/compare/default-a...fregante-patch-1
- "Allow edits from maintainers": https://github.com/refined-github/refined-github/compare/main...fregante:refined-github:main?expand=1

*/
