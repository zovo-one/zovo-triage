const supportedLabels =
	/^(?:bug|bug-?fix|confirmed-bug|(?:category|type|kind|triage|issue)[-/:]bug|(?::[\w-]+:|\p{Emoji})bug)$/iu;
function isBugLabel(label) {
	return supportedLabels.test(label.replaceAll(/\s/g, ''));
}

export { isBugLabel as default };
