function isQueryable(object) {
    return typeof object.querySelectorAll === 'function';
}
function $optional(selectors, baseElement) {
    if (arguments.length === 2 && !baseElement) {
        return;
    }
    return (baseElement ?? document).querySelector(String(selectors)) ?? undefined;
}
class ElementNotFoundError extends Error {
    name = 'ElementNotFoundError';
}
function $(selectors, baseElement) {
    if (arguments.length === 2 && !baseElement) {
        throw new ElementNotFoundError('Expected element not found because the base is specified but null');
    }
    const element = (baseElement ?? document).querySelector(String(selectors));
    if (element) {
        return element;
    }
    throw new ElementNotFoundError(`Expected element not found: ${String(selectors)}`);
}
function lastElementOptional(selectors, baseElement) {
    if (arguments.length === 2 && !baseElement) {
        return undefined;
    }
    const all = (document).querySelectorAll(String(selectors));
    return all[all.length - 1];
}
function elementExists(selectors, baseElement) {
    if (arguments.length === 2 && !baseElement) {
        return false;
    }
    return Boolean((baseElement ?? document).querySelector(String(selectors)));
}
function countElements(selectors, baseElement) {
    if (arguments.length === 2 && !baseElement) {
        return 0;
    }
    return (document).querySelectorAll(String(selectors)).length;
}
function $$optional(selectors, baseElements) {
    if (arguments.length === 2 && !baseElements) {
        return [];
    }
    if (!baseElements || isQueryable(baseElements)) {
        const elements = (baseElements ?? document).querySelectorAll(String(selectors));
        return Array.prototype.slice.call(elements);
    }
    const elements = new Set();
    for (const baseElement of baseElements) {
        for (const element of baseElement.querySelectorAll(String(selectors))) {
            elements.add(element);
        }
    }
    return [...elements];
}
function $$(selectors, baseElements) {
    if (arguments.length === 2 && !baseElements) {
        throw new ElementNotFoundError('Expected elements not found because the base is specified but null');
    }
    const elements = arguments.length === 2 ? $$optional(selectors, baseElements) : $$optional(selectors);
    if (elements.length > 0) {
        return elements;
    }
    throw new ElementNotFoundError(`Expected elements not found: ${String(selectors)}`);
}
function closestElementOptional(selectors, baseElement) {
    if (!baseElement) {
        return undefined;
    }
    const element = baseElement instanceof Element ? baseElement : baseElement.parentElement;
    return element?.closest(String(selectors)) ?? undefined;
}
function closestElement(selectors, baseElement) {
    if (!baseElement) {
        throw new ElementNotFoundError('Expected closest element not found: base element is null or undefined');
    }
    const element = baseElement instanceof Element ? baseElement : baseElement.parentElement;
    const found = element?.closest(String(selectors));
    if (found) {
        return found;
    }
    throw new ElementNotFoundError(`Expected closest element not found: ${String(selectors)}`);
}
function lastElement(selectors, baseElement) {
    if (arguments.length === 2 && !baseElement) {
        throw new ElementNotFoundError('Expected element not found because the base is specified but null');
    }
    const all = (document).querySelectorAll(String(selectors));
    if (all.length > 0) {
        return all[all.length - 1];
    }
    throw new ElementNotFoundError(`Expected element not found: ${String(selectors)}`);
}

export { $, $$, $$optional, $optional, ElementNotFoundError, closestElement, closestElementOptional, countElements, elementExists, lastElement, lastElementOptional };
