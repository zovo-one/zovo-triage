import { clsx } from '../npm/ztg-clsx-clsx.js';
import React from '../npm/ztg-dom-chef.js';
import { isPRConversation } from '../npm/ztg-github-url-detection.js';
import CopilotIcon from '../npm/ztg-octicons-plain-react-components-Copilot.js';
import { $$, elementExists, $optional, $ } from '../npm/ztg-select-dom.js';
import { setFieldText } from '../npm/ztg-text-field-edit.js';
import features from '../ztg-feature-manager.js';
import { legacyCommentField } from '../github-helpers/ztg-selectors.js';
import withMenuOpen from '../github-helpers/ztg-with-menu-open.js';
import observe from '../helpers/ztg-selector-observer.js';
import { withTooltipRef } from '../components/ztg-tooltip.js';

function insertCopilotInstruction() {
	const textarea = $(legacyCommentField);
	setFieldText(textarea, '@copilot resolve the merge conflicts in this pull request');
}

function createResolveConflictsButtons(menuItems) {
	return (
		React.createElement('div', { className: "ButtonGroup",}
, menuItems.map(item => {
				const isCopilotItem = elementExists('.octicon-agent', item);
				const isWebEditorItem = elementExists('.octicon-pencil', item);
				if (!isCopilotItem && !isWebEditorItem) {
					throw new TypeError('Unknown dropdown item');
				}

				const inactiveWarning = $optional('[class*="InactiveWarning"]', item);
				// Doesn't exist if the item is enabled
				const inactiveReason = inactiveWarning?.textContent.trim();
				const isDisabled = Boolean(inactiveReason);
				const shouldHaveTooltip = isCopilotItem || isDisabled;

				const className = clsx('Button Button--medium Button--secondary', isCopilotItem && 'Button--iconOnly');
				const content = isCopilotItem
					? React.createElement(CopilotIcon, null )
					: (
						React.createElement('span', { className: "Button-content",}
, React.createElement('span', { className: "Button-label",}, "Resolve conflicts"

)
)
					);
				const ref = shouldHaveTooltip ? withTooltipRef(inactiveReason ?? 'Ask Copilot to resolve conflicts') : undefined;

				return React.createElement('div', null
, isWebEditorItem && !isDisabled
						? (
							React.createElement('a', { ref: ref, className: className, href: `${location.pathname}/conflicts`,}
, content
)
						)
						: (
							React.createElement('button', {
								ref: ref,
								className: className,
								type: "button",
								disabled: isDisabled,
								onClick: isCopilotItem ? insertCopilotInstruction : undefined,}

, content
)
						)
);
			})
)
	);
}

async function replaceResolveConflictsDropdown(button) {
	if (button.textContent.trim() !== 'Resolve conflicts') {
		return;
	}

	const menuItems = await withMenuOpen(button, menu => $$('li[data-component="ActionList.Item"]', menu));
	const buttonGroup = createResolveConflictsButtons(menuItems);
	button.replaceWith(buttonGroup);
}

function initPrConversation(signal) {
	// `data-component` is used to avoid selecting our button and one of the files with conflicts
	observe(
		'[aria-label="Conflicts"] [class^="MergeBoxSectionHeader-module__wrapper"] button[data-component$="Button"]',
		replaceResolveConflictsDropdown,
		{signal},
	);
}

void features.add(import.meta.url, {
	include: [
		isPRConversation,
	],
	init: initPrConversation,
});

/*

Test URLs:

- https://github.com/refined-github/sandbox/pull/82

*/
