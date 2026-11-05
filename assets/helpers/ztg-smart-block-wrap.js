// Wraps string in at least two newlines on each side,
// as long as the field doesn't already have them.
// Code adapted from GitHub.
function smartBlockWrap(
	content,
	field,
) {
	const before = field.value.slice(0, field.selectionStart);
	const after = field.value.slice(field.selectionEnd);
	const [whitespaceAtStart] = /\n*$/.exec(before);
	const [whitespaceAtEnd] = /^\n*/.exec(after);
	const newlinesToPrepend = /\S/.test(before) && whitespaceAtStart.length < 2
		? '\n'.repeat(2 - whitespaceAtStart.length)
		: '';

	const newlinesToAppend = /\S/.test(after) && whitespaceAtEnd.length < 2
		? '\n'.repeat(2 - whitespaceAtEnd.length)
		: '';

	return newlinesToPrepend + content + newlinesToAppend;
}

export { smartBlockWrap as default };
