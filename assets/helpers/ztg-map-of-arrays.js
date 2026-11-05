class ArrayMap extends Map {
	append(key, ...values) {
		if (!this.has(key)) {
			this.set(key, []);
		}

		this.get(key).push(...values);
	}
}

export { ArrayMap as default };
