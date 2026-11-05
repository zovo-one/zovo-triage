function isNativeField(field) {
    return field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement;
}
function withFocus(field, callback) {
    const document = field.ownerDocument;
    const initialFocus = document.activeElement;
    if (initialFocus === field) {
        return callback();
    }
    try {
        field.focus();
        return callback();
    }
    finally {
        field.blur();
        if (initialFocus instanceof HTMLElement) {
            initialFocus.focus();
        }
    }
}
function insertTextWhereverTheFocusIs(document, text) {
    if (text === '') {
        document.execCommand('delete');
    }
    else {
        document.execCommand('insertText', false, text);
    }
}
function insertTextIntoField(field, text) {
    withFocus(field, () => {
        insertTextWhereverTheFocusIs(field.ownerDocument, text);
    });
}
function setFieldText(field, text) {
    if (isNativeField(field)) {
        field.select();
        insertTextIntoField(field, text);
    }
    else {
        const document = field.ownerDocument;
        withFocus(field, () => {
            document.execCommand('selectAll', false, text);
            insertTextWhereverTheFocusIs(document, text);
        });
    }
}
function getFieldSelection(field) {
    if (isNativeField(field)) {
        return field.value.slice(field.selectionStart, field.selectionEnd);
    }
    const selection = field.ownerDocument.getSelection();
    if (selection && field.contains(selection.anchorNode)) {
        return selection.toString();
    }
    return '';
}
function wrapFieldSelectionNative(field, wrap, wrapEnd) {
    const { selectionStart, selectionEnd } = field;
    const selection = getFieldSelection(field);
    insertTextIntoField(field, wrap + selection + wrapEnd);
    field.selectionStart = selectionStart + wrap.length;
    field.selectionEnd = selectionEnd + wrap.length;
}
function collapseCursor(selection, range, toStart) {
    const alteredRange = range.cloneRange();
    alteredRange.collapse(toStart);
    selection.removeAllRanges();
    selection.addRange(alteredRange);
}
function wrapFieldSelectionContentEditable(field, before, after) {
    const document = field.ownerDocument;
    const selection = document.getSelection();
    const selectionRange = selection.getRangeAt(0);
    if (after) {
        collapseCursor(selection, selectionRange, false);
        insertTextIntoField(field, after);
    }
    if (before) {
        collapseCursor(selection, selectionRange, true);
        insertTextIntoField(field, before);
        selectionRange.setStart(selectionRange.startContainer, selectionRange.startOffset + before.length);
    }
    if (after ?? before) {
        selection.removeAllRanges();
        selection.addRange(selectionRange);
    }
}
function wrapFieldSelection(field, wrap,
wrapEnd = wrap) {
    if (isNativeField(field)) {
        wrapFieldSelectionNative(field, wrap, wrapEnd);
    }
    else {
        wrapFieldSelectionContentEditable(field, wrap, wrapEnd);
    }
}
function replaceFieldText(field, searchValue, replacer, cursor = 'select') {
    if (!isNativeField(field)) {
        throw new TypeError('replaceFieldText only supports input and textarea fields');
    }
    let drift = 0;
    withFocus(field, () => {
        field.value.replace(searchValue, (...arguments_) => {
            const matchStart = drift + arguments_.at(-2);
            const matchLength = arguments_[0].length;
            field.selectionStart = matchStart;
            field.selectionEnd = matchStart + matchLength;
            const replacement = typeof replacer === 'string' ? replacer : replacer(...arguments_);
            insertTextWhereverTheFocusIs(field.ownerDocument, replacement);
            if (cursor === 'select') {
                field.selectionStart = matchStart;
            }
            drift += replacement.length - matchLength;
            return replacement;
        });
    });
}

export { withFocus as _TEST_ONLY_withFocus, getFieldSelection, insertTextIntoField, replaceFieldText, setFieldText, wrapFieldSelection };
