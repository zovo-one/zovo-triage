import { create_element } from './ztg-svelte-internal-client-dom-operations.js';

const policy =
	globalThis?.window?.trustedTypes &&
	 globalThis.window.trustedTypes.createPolicy('svelte-trusted-html', {
		createHTML: (html) => {
			return html;
		}
	});
function create_trusted_html(html) {
	return  (policy?.createHTML(html) ?? html);
}
function create_fragment_from_html(html) {
	var elem = create_element('template');
	elem.innerHTML = create_trusted_html(html.replaceAll('<!>', '<!---->'));
	return elem.content;
}

export { create_fragment_from_html, create_trusted_html };
