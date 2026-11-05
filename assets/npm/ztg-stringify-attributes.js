import { e as escapeGoatExports } from '../_virtual/ztg-index4.js';

function stringifyAttributes(attributes) {
	const handledAttributes = [];
	for (let [key, value] of Object.entries(attributes)) {
		if (value === false) {
			continue;
		}
		if (Array.isArray(value)) {
			value = value.join(' ');
		}
		let attribute = escapeGoatExports.htmlEscape(key);
		if (value !== true) {
			attribute += `="${escapeGoatExports.htmlEscape(String(value))}"`;
		}
		handledAttributes.push(attribute);
	}
	return handledAttributes.length > 0 ? ' ' + handledAttributes.join(' ') : '';
}

export { stringifyAttributes as default };
