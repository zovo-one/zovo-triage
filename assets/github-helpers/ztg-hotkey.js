import React from '../npm/ztg-dom-chef.js';
import { isMac } from './ztg-index.js';

function registerHotkey(
	hotkey,
	functionOrUrl,
	{signal} = {},
) {
	const element = typeof functionOrUrl === 'string'
		? React.createElement('a', { hidden: true, href: functionOrUrl, 'data-hotkey': hotkey,} )
		: React.createElement('button', { hidden: true, type: "button", 'data-hotkey': hotkey, onClick: functionOrUrl,} );

	document.body.prepend(element);

	signal?.addEventListener('abort', () => {
		element.remove();
	});
}

function overrideHotkey(button, hotkey) {
	if (!button) {
		return;
	}

	button.dataset.hotkey = hotkey;
}

const modifierKey = isMac ? 'cmd' : 'ctrl';

export { modifierKey, overrideHotkey, registerHotkey };
