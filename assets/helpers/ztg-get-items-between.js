/**
Get the items between previous and current, both ends included. If `previous` is missing, start from 0
*/
function getItemsBetween(items, previous, current) {
	const start = previous ? items.indexOf(previous) : 0;
	const end = items.indexOf(current);

	return items.slice(Math.min(start, end), Math.max(start, end) + 1);
}

export { getItemsBetween as default };
