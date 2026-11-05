import requestAnimationFrames from './ztg-request-animation-frames.js';

const getOwnerDocument = target => {
	if (target?.nodeType === Node.DOCUMENT_NODE) {
		return target;
	}
	return target?.ownerDocument ?? target?.host?.ownerDocument;
};
const isDomReady = target => {
	const ownerDocument = getOwnerDocument(target);
	return ownerDocument ? ['interactive', 'complete'].includes(ownerDocument.readyState) : false;
};
async function elementReady(selector, {
	target = document,
	stopOnDomReady = true,
	waitForChildren = true,
	signal,
	predicate,
} = {}) {
	if (signal?.aborted) {
		return;
	}
	if (stopOnDomReady && isDomReady(target)) {
		return getMatchingElement({target, selector, predicate});
	}
	for await (const _ of requestAnimationFrames()) {
		if (signal?.aborted) {
			return;
		}
		const element = getMatchingElement({target, selector, predicate});
		if (isDomReady(target) && (stopOnDomReady || element)) {
			return element;
		}
		if (element && (!waitForChildren || isChildrenReady({element, target}))) {
			return element;
		}
	}
}
function getMatchingElement({target, selector, predicate}) {
	if (!predicate) {
		return target.querySelector(selector) ?? undefined;
	}
	for (const element of target.querySelectorAll(selector)) {
		if (predicate(element)) {
			return element;
		}
	}
}
function isChildrenReady({element, target}) {
	const ownerDocument = getOwnerDocument(target) ?? element.ownerDocument;
	if (isDomReady(ownerDocument ?? element)) {
		return true;
	}
	let current = element;
	while (current) {
		if (current === target || current === ownerDocument?.head) {
			return false;
		}
		if (current.nextSibling) {
			return true;
		}
		current = current.parentNode;
	}
	return false;
}

export { elementReady as default };
