const urlRegex = () => (/((?<!\+)https?:\/\/(?:www\.)?(?:[-\p{Letter}\d.]+?[.@][a-zA-Z\d]{2,}|localhost|\[[0-9a-fA-F:]+(?:\.[0-9]{1,3}){0,4}\])(?:[-\w\p{Letter}.:%+~#*$!?&/=@]*?(?:,(?!\s))*?)*)/gu);
const isTruncated = (url, peek) =>
	url.endsWith('...')
	|| peek.startsWith('…');
function parseUrl(url) {
	const punctuation = /[.?]$/.exec(url)?.[0] ?? '';
	const href = punctuation ? url.slice(0, -1) : url;
	return {href, punctuation};
}
function processUrlParts(string, options, renderer) {
	const parts = string.split(urlRegex());
	const results = [];
	for (const [index, text] of parts.entries()) {
		if (index % 2 && !isTruncated(text, parts[index + 1])) {
			results.push(renderer.link(text, options, index));
		} else if (text.length > 0) {
			results.push(renderer.text(text));
		}
	}
	return results;
}

export { parseUrl, processUrlParts };
