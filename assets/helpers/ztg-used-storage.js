function getTrueSizeOfObject(object) {
	// Firefox https://bugzilla.mozilla.org/show_bug.cgi?id=1385832#c20
	return new TextEncoder().encode(
		Object.entries(object)
			.map(([key, value]) => key + JSON.stringify(value))
			.join(''),
	).length;
}

/** `getBytesInUse` polyfill */
async function getStorageBytesInUse(area) {
	const storage = chrome.storage[area];
	try {
		return await storage.getBytesInUse(); // Exists in Safari iOS, but can't be called...
	} catch {
		return getTrueSizeOfObject(await storage.get());
	}
}

async function getStoredItemSize(area, item) {
	const storage = chrome.storage[area];
	return getTrueSizeOfObject(await storage.get(item));
}

export { getStorageBytesInUse, getStoredItemSize, getTrueSizeOfObject };
