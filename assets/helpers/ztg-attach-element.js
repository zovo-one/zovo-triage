import { elementExists } from '../npm/ztg-select-dom.js';
import getCallerId from './ztg-caller-id.js';

function attachElement(
	anchor,
	{
		before,
		after,
	},
) {
	if (!anchor) {
		throw new Error('Element not found');
	}

	const className = 'rgh-attached-' + getCallerId();
	if (elementExists('.' + className, anchor.parentElement)) {
		return;
	}

	if (before) {
		const element = before(anchor);
		element.classList.add(className);
		anchor.before(element);
	}

	if (after) {
		const element = after(anchor);
		element.classList.add(className);
		anchor.after(element);
	}
}

export { attachElement as default };
