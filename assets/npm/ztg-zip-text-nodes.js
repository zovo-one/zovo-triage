var zipTextNodes;
var hasRequiredZipTextNodes;
function requireZipTextNodes () {
	if (hasRequiredZipTextNodes) return zipTextNodes;
	hasRequiredZipTextNodes = 1;
	function getIndex(container, target) {
	    let index = 0;
	    do {
	        while (target.previousSibling) {
	            index += target.previousSibling.textContent.length;
	            target = target.previousSibling;
	        }
	        target = target.parentElement;
	    } while (target && target !== container);
	    return index;
	}
	function getNodeAtIndex(container, index) {
	    let relativeIndex = index;
	    let cursor = container;
	    while (cursor && cursor.firstChild) {
	        cursor = cursor.firstChild;
	        while (cursor && cursor.textContent.length < relativeIndex) {
	            relativeIndex -= cursor.textContent.length;
	            if (cursor.nextSibling) {
	                cursor = cursor.nextSibling;
	            }
	        }
	    }
	    return [cursor, relativeIndex];
	}
	function getSmartIndexRange(node, start, end) {
	    const range = document.createRange();
	    range.setStart(...getNodeAtIndex(node, start));
	    range.setEnd(...getNodeAtIndex(node, end));
	    return range;
	}
	zipTextNodes = function (target, source) {
	    if (target.textContent !== source.textContent) {
	        throw new Error('`target` and `source` must have matching `textContent`');
	    }
	    for (const child of source.querySelectorAll('*')) {
	        const textIndex = getIndex(source, child);
	        const newEl = child.cloneNode();
	        const contentsRange = getSmartIndexRange(target, textIndex, textIndex + child.textContent.length);
	        newEl.append(contentsRange.extractContents());
	        contentsRange.insertNode(newEl);
	    }
	};
	return zipTextNodes;
}

export { requireZipTextNodes as __require };
