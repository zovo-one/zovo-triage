import { pEveryFunction, pSomeFunction } from './ztg-p-utils.js';

function isFeaturePrivate(id) {
	return id.startsWith('rgh-');
}

// Safari iOS 17.6 has the key, but it does nothing
const doesBrowserActionOpenOptions = !globalThis.chrome?.contextMenus
	|| navigator.platform === 'iPhone'
	|| navigator.platform === 'iPad';

async function shouldFeatureRun({
	/** Every condition must be true */
	asLongAs = [() => true],
	/** At least one condition must be true */
	include = [() => true],
	/** No conditions must be true */
	exclude = [() => false],
}) {
	return await pEveryFunction(asLongAs, c => c())
		&& await pSomeFunction(include, c => c())
		&& pEveryFunction(exclude, async c => !await c());
}

export { doesBrowserActionOpenOptions, isFeaturePrivate, shouldFeatureRun };
