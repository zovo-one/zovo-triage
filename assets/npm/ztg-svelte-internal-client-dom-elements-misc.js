import { hydrating } from './ztg-svelte-internal-client-dom-hydration.js';
import { get_first_child, clear_text_content } from './ztg-svelte-internal-client-dom-operations.js';
import { FORM_RESET_HANDLER } from './ztg-svelte-internal-client-constants.js';

function remove_textarea_child(dom) {
	if (hydrating && get_first_child(dom) !== null) {
		clear_text_content(dom);
	}
}
let listening_to_form_reset = false;
function add_form_reset_listener() {
	if (!listening_to_form_reset) {
		listening_to_form_reset = true;
		document.addEventListener(
			'reset',
			(evt) => {
				Promise.resolve().then(() => {
					if (!evt.defaultPrevented) {
						for (const e of  (evt.target).elements) {
							 (e)[FORM_RESET_HANDLER]?.();
						}
					}
				});
			},
			{ capture: true }
		);
	}
}

export { add_form_reset_listener, remove_textarea_child };
