import { globalCache } from '../npm/ztg-webext-storage-cache.js';

async function clearCacheHandler() {
	await globalCache.clear();
	const initialText = this.textContent;
	this.textContent = 'Cache cleared!';
	this.disabled = true;
	setTimeout(() => {
		this.textContent = initialText;
		this.disabled = false;
	}, 2000);
}

export { clearCacheHandler as default };
