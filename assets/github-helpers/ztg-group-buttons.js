import React from '../npm/ztg-dom-chef.js';
import { $, closestElementOptional } from '../npm/ztg-select-dom.js';
import { wrapAll } from '../helpers/ztg-dom-utils.js';

// Wrap a list of elements with BtnGroup + ensure each has BtnGroup-item
function groupButtons(buttons, ...classes) {
	// Ensure every button has this class
	for (let button of buttons) {
		if (!button.matches('button, .btn')) {
			button.classList.add('BtnGroup-parent');
			button = $('.btn', button);
		}

		button.classList.add('BtnGroup-item');
	}

	// They may already be part of a group
	let group = closestElementOptional('.BtnGroup', buttons[0]);

	// If it doesn't exist, wrap them in a new group
	if (!group) {
		group = React.createElement('div', { className: "BtnGroup",} );
		wrapAll(group, ...buttons);
	}

	group.classList.add(...classes);

	return group;
}

export { groupButtons };
