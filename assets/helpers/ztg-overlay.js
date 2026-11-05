import React from '../npm/ztg-dom-chef.js';

async function showOverlay(content) {
	const overlay = React.createElement('div', { className: "rgh-overlay",}, content);
	document.body.append(overlay);
	await overlay.animate(
		[{opacity: 1}, {opacity: 0}],
		{
			duration: 300,
			delay: 2000,
			easing: 'ease-in',
			fill: 'forwards',
		},
	).finished;
	overlay.remove();
}

export { showOverlay as default };
