import '../npm/ztg-svelte-internal-client-constants.js';
import { mount } from '../npm/ztg-svelte-internal-client-render.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import Tooltip from './ztg-tooltip.svelte.js';

function createTooltipFor(element, content) {
	// Ensure the element has an ID for the `for` attribute to link to
	element.id ||= crypto.randomUUID();

	const tooltipId = crypto.randomUUID();
	element.setAttribute('aria-labelledby', tooltipId);

	const options = typeof content === 'string' ? {label: content} : content;
	mount(Tooltip, {
		target: element,
		props: {
			id: tooltipId,
			htmlFor: element.id,
			...options,
		},
	});
}

/**
Attaches a tooltip to an existing element. Don't use this with JSX.
@example addTooltip('Does something', $('.some-existing-button'))
*/
function addTooltip(
	content,
	element,
) {
	if (!element.parentElement) {
		throw new Error('Element has no parent. Use `tooltipped` instead for elements not yet attached to a parent.');
	}

	createTooltipFor(element, content);
}

/**
Ref callback that attaches a tooltip to the element it's bound to.
@example <summary ref={withTooltipRef('Add a table')}>...</summary>
*/
function withTooltipRef(
	content,
	// eslint-disable-next-line @typescript-eslint/no-restricted-types -- Native type
) {
	return element => {
		if (element) {
			createTooltipFor(element, content);
		}
	};
}

export { addTooltip as default, withTooltipRef };
