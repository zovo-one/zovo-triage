import { effect } from './ztg-svelte-internal-client-reactivity-effects.js';
import { create_element } from './ztg-svelte-internal-client-dom-operations.js';

function append_styles(anchor, css) {
	effect(() => {
		var root = anchor.getRootNode();
		var target =  (root).host
			?  (root)
			:  (root).head ??  (root.ownerDocument).head;
		if (!target.querySelector('#' + css.hash)) {
			const style = create_element('style');
			style.id = css.hash;
			style.textContent = css.code;
			target.appendChild(style);
		}
	});
}

export { append_styles };
