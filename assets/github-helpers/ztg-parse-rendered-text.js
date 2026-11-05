import getTextNodes from '../helpers/ztg-get-text-nodes.js';

const excludeFromDomTextExtraction = 'rgh-exclude-from-dom-text-extraction';

function parseRenderedText(element) {
	return getTextNodes(element)
		.map(node => {
			if (node.parentElement?.tagName === 'CODE') {
				return `\`${node.nodeValue?.trim()}\``;
			}

			if (
				node.parentElement?.tagName === 'BUTTON'
				|| node.parentElement?.classList.contains(excludeFromDomTextExtraction)
			) {
				return '';
			}

			return node.nodeValue;
		})
		.join('')
		.trim();
}

export { parseRenderedText as default, excludeFromDomTextExtraction };
