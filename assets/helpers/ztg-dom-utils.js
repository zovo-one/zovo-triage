import { $, $optional, $$, ElementNotFoundError } from '../npm/ztg-select-dom.js';

// eslint-disable-next-line @typescript-eslint/no-restricted-types -- Nodes may be exactly `null`


/**
 Append to an element, but before a element that might not exist.
 @param parent Element (or its selector) to which append the `child`
 @param before Selector of the element that `child` should be inserted before
 @param child Element to append
 @example

 <parent>
	<yes/>
	<oui/>
	<nope/>
 </parent>

 appendBefore('parent', 'nope', <sì/>);

 <parent>
  <yes/>
  <oui/>
  <sì/>
  <nope/>
 </parent>
 */
const appendBefore = (parent, before, child) => {
	if (typeof parent === 'string') {
		parent = $(parent);
	}

	// Select direct children only
	const beforeElement = $optional(`:scope > :is(${before})`, parent);
	if (beforeElement) {
		beforeElement.before(child);
	} else {
		parent.append(child);
	}
};

const wrap = (target, wrapper) => {
	target.before(wrapper);
	wrapper.append(target);
};

const wrapAll = (wrapper, ...targets) => {
	const [first, ...rest] = targets;
	first.before(wrapper);
	wrapper.append(first, ...rest);
	return wrapper;
};

const isEditable = (node) =>
	node instanceof HTMLTextAreaElement
	|| node instanceof HTMLInputElement
	|| (node instanceof HTMLElement && node.isContentEditable);

const frame = async () =>
	new Promise(resolve => {
		requestAnimationFrame(resolve);
	});

const matchString = (matcher, string) =>
	typeof matcher === 'string' ? matcher === string : matcher.test(string);

const escapeMatcher = (matcher) =>
	typeof matcher === 'string' ? `"${matcher}"` : String(matcher);

const isTextNode = (node) =>
	node instanceof Text || ([...node.childNodes].every(childNode => childNode instanceof Text));

const isTextNodeContaining = (node, expectation) => {
	// Make sure only text is being considered, not links, icons, etc
	if (!node || !isTextNode(node)) {
		console.warn('Expected Text node', node);
		throw new TypeError(`Expected Text node, received ${String(node?.nodeName)}`);
	}

	// The string/regex may expect spaces, like for `conventional-commits`
	return matchString(expectation, node.textContent) || matchString(expectation, node.textContent.trim());
};

const assertNodeContent = (node, expectation) => {
	if (isTextNodeContaining(node, expectation)) {
		return node;
	}

	console.warn('Expected node:', node?.parentElement);
	const content = node?.textContent.trim();
	throw new Error(`Expected node matching ${escapeMatcher(expectation)}, found ${escapeMatcher(content ?? 'null')}`);
};

/** Prefer `assertNodeContent` for more precise matches */
const assertTextContent = (element, expectation) => {
	const content = element?.textContent.trim();
	if (content === expectation) {
		return;
	}

	console.warn('Expected element:', element);
	throw new Error(`Expected element matching "${expectation}", found "${content}"`);
};

const removeTextNodeContaining = (node, expectation) => {
	assertNodeContent(node, expectation);
	node.remove();
};

function removeTextInTextNode(node, text) {
	assertNodeContent(node, text);
	node.textContent = node.textContent.replace(text, '');
}

function getElementByAriaLabelledBy(baseSelector, label) {
	for (const element of $$(baseSelector + '[aria-labelledby]')) {
		const labelElement = $optional(`[id="${element.getAttribute('aria-labelledby')}"]`);

		if (labelElement?.textContent?.trim() === label) {
			return element ;
		}
	}

	throw new ElementNotFoundError(`Expected element labelled "${label}" not found in: ${baseSelector}`);
}

function getClasses(element) {
	const list = new Set();
	for (const cls of element.classList) {
		if (!cls.startsWith('rgh-')) {
			list.add(cls);
		}
	}

	return list;
}

const _isSmallDevice = screen.width < 500;
function isSmallDevice() {
	return _isSmallDevice;
}

export { appendBefore, assertNodeContent, assertTextContent, frame, getClasses, getElementByAriaLabelledBy, isEditable, isSmallDevice, isTextNodeContaining, removeTextInTextNode, removeTextNodeContaining, wrap, wrapAll };
