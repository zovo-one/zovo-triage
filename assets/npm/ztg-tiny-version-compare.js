const splitDev = v => String(v).split('-');
const splitSub = v => String(v)
	.replace(/^[vr]/, '')
	.replace(/([a-z]+)/gi, '.$1.')
	.replace(/\.+/g, '.')
	.split('.');
const offset = part => {
	if (isNaN(part)) {
		return part;
	}
	return 5 + Number(part);
};
const parseSub = part => {
	if (typeof part === 'undefined') {
		return 0;
	}
	switch (part.toLowerCase()) {
		case 'dev': return -5;
		case 'alpha': case 'a': return -4;
		case 'beta': case 'b': return -3;
		case 'rc': case 'c': return -2;
		case 'pre': return -1;
	}
	return part;
};
function compareSubs(a, b) {
	for (let i = 0; i < a.length || i < b.length; i++) {
		const ai = offset(parseSub(a[i]));
		const bi = offset(parseSub(b[i]));
		const sort = String(ai).localeCompare(bi, 'en', {
			numeric: true,
		});
		if (sort !== 0) {
			return sort;
		}
	}
	return 0;
}
function compareVersions(a, b) {
	if (a === b) {
		return 0;
	}
	const [aMain, aDev] = splitDev(a).map(splitSub);
	const [bMain, bDev] = splitDev(b).map(splitSub);
	const mainSort = compareSubs(aMain, bMain);
	if (mainSort !== 0) {
		return mainSort;
	}
	if (aDev && !bDev) {
		return -1;
	}
	if (!aDev && bDev) {
		return 1;
	}
	if (aDev && bDev) {
		return compareSubs(aDev, bDev);
	}
	return 0;
}

export { compareVersions as default };
