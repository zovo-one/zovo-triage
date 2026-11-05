import React from '../npm/ztg-dom-chef.js';
import { messageRuntime } from '../npm/ztg-webext-msg.js';

function openOptions(event, hash) {
	event.preventDefault();
	void messageRuntime({openOptionsPage: hash ?? ''});
}

function OptionsLink() {
	return (
		React.createElement('button', { type: "button", onClick: openOptions,} )
	);
}

export { OptionsLink, openOptions as default };
