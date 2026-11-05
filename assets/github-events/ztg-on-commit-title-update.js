import delegate from '../npm/ztg-delegate-it-delegate.js';

const fieldSelector = [
	// PR merge message field
	'[data-testid="mergebox-partial"] input[type="text"]',
	// Commit title on edit file page
	'#commit-message-input',
];

function onCommitTitleUpdate(
	callback,
	signal,
) {
	// For immediate user input
	delegate(fieldSelector, 'input', callback, {signal});
}

export { onCommitTitleUpdate as default };
