import { state, source, set, increment } from './ztg-svelte-internal-client-reactivity-sources.js';
import './ztg-svelte-internal-client-constants.js';
import { update_version, get } from './ztg-svelte-internal-client-runtime.js';

class SvelteMap extends Map {
	#sources = new Map();
	#version = state(0);
	#size = state(0);
	#update_version = update_version || -1;
	constructor(value) {
		super();
		if (value) {
			for (var [key, v] of value) {
				super.set(key, v);
			}
			this.#size.v = super.size;
		}
	}
	#source(value) {
		return update_version === this.#update_version ? state(value) : source(value);
	}
	has(key) {
		var sources = this.#sources;
		var s = sources.get(key);
		if (s === undefined) {
			if (super.has(key)) {
				s = this.#source(0);
				sources.set(key, s);
			} else {
				get(this.#version);
				return false;
			}
		}
		get(s);
		return true;
	}
	forEach(callbackfn, this_arg) {
		this.#read_all();
		super.forEach(callbackfn, this_arg);
	}
	get(key) {
		var sources = this.#sources;
		var s = sources.get(key);
		if (s === undefined) {
			if (super.has(key)) {
				s = this.#source(0);
				sources.set(key, s);
			} else {
				get(this.#version);
				return undefined;
			}
		}
		get(s);
		return super.get(key);
	}
	set(key, value) {
		var sources = this.#sources;
		var s = sources.get(key);
		var prev_res = super.get(key);
		var res = super.set(key, value);
		var version = this.#version;
		if (s === undefined) {
			s = this.#source(0);
			sources.set(key, s);
			set(this.#size, super.size);
			increment(version);
		} else if (prev_res !== value) {
			increment(s);
			var v_reactions = version.reactions === null ? null : new Set(version.reactions);
			var needs_version_increase =
				v_reactions === null ||
				!s.reactions?.every((r) =>
					 (v_reactions).has(r)
				);
			if (needs_version_increase) {
				increment(version);
			}
		}
		return res;
	}
	delete(key) {
		var sources = this.#sources;
		var s = sources.get(key);
		var res = super.delete(key);
		if (s !== undefined) {
			sources.delete(key);
			set(s, -1);
		}
		if (res) {
			set(this.#size, super.size);
			increment(this.#version);
		}
		return res;
	}
	clear() {
		if (super.size === 0) {
			return;
		}
		super.clear();
		var sources = this.#sources;
		set(this.#size, 0);
		for (var s of sources.values()) {
			set(s, -1);
		}
		increment(this.#version);
		sources.clear();
	}
	#read_all() {
		get(this.#version);
		var sources = this.#sources;
		if (this.#size.v !== sources.size) {
			for (var key of super.keys()) {
				if (!sources.has(key)) {
					var s = this.#source(0);
					sources.set(key, s);
				}
			}
		}
		for ([, s] of this.#sources) {
			get(s);
		}
	}
	keys() {
		get(this.#version);
		return super.keys();
	}
	values() {
		this.#read_all();
		return super.values();
	}
	entries() {
		this.#read_all();
		return super.entries();
	}
	[Symbol.iterator]() {
		return this.entries();
	}
	get size() {
		get(this.#size);
		return super.size;
	}
}

export { SvelteMap };
