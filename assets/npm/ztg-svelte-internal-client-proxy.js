import { get, active_effect, update_version, set_active_reaction, set_update_version, active_reaction } from './ztg-svelte-internal-client-runtime.js';
import { object_prototype, array_prototype, get_descriptor, get_prototype_of, is_array } from './ztg-svelte-internal-shared-utils.js';
import { state, set, increment } from './ztg-svelte-internal-client-reactivity-sources.js';
import { STATE_SYMBOL } from './ztg-svelte-internal-client-constants.js';
import { UNINITIALIZED } from './ztg-svelte-constants.js';
import { state_prototype_fixed, state_descriptors_fixed } from './ztg-svelte-internal-client-errors.js';

function proxy(value) {
	if (typeof value !== 'object' || value === null || STATE_SYMBOL in value) {
		return value;
	}
	const prototype = get_prototype_of(value);
	if (prototype !== object_prototype && prototype !== array_prototype) {
		return value;
	}
	var sources = new Map();
	var is_proxied_array = is_array(value);
	var version = state(0);
	var parent_version = update_version;
	var with_parent = (fn) => {
		if (update_version === parent_version) {
			return fn();
		}
		var reaction = active_reaction;
		var version = update_version;
		set_active_reaction(null);
		set_update_version(parent_version);
		var result = fn();
		set_active_reaction(reaction);
		set_update_version(version);
		return result;
	};
	if (is_proxied_array) {
		sources.set('length', state( (value).length));
	}
	return new Proxy( (value), {
		defineProperty(_, prop, descriptor) {
			if (
				!('value' in descriptor) ||
				descriptor.configurable === false ||
				descriptor.enumerable === false ||
				descriptor.writable === false
			) {
				state_descriptors_fixed();
			}
			var s = sources.get(prop);
			if (s === undefined) {
				with_parent(() => {
					var s = state(descriptor.value);
					sources.set(prop, s);
					return s;
				});
			} else {
				set(s, descriptor.value, true);
			}
			return true;
		},
		deleteProperty(target, prop) {
			var s = sources.get(prop);
			if (s === undefined) {
				if (prop in target) {
					const s = with_parent(() => state(UNINITIALIZED));
					sources.set(prop, s);
					increment(version);
				}
			} else {
				set(s, UNINITIALIZED);
				increment(version);
			}
			return true;
		},
		get(target, prop, receiver) {
			if (prop === STATE_SYMBOL) {
				return value;
			}
			var s = sources.get(prop);
			var exists = prop in target;
			if (s === undefined && (!exists || get_descriptor(target, prop)?.writable)) {
				s = with_parent(() => {
					var p = proxy(exists ? target[prop] : UNINITIALIZED);
					var s = state(p);
					return s;
				});
				sources.set(prop, s);
			}
			if (s !== undefined) {
				var v = get(s);
				return v === UNINITIALIZED ? undefined : v;
			}
			return Reflect.get(target, prop, receiver);
		},
		getOwnPropertyDescriptor(target, prop) {
			var descriptor = Reflect.getOwnPropertyDescriptor(target, prop);
			if (descriptor && 'value' in descriptor) {
				var s = sources.get(prop);
				if (s) descriptor.value = get(s);
			} else if (descriptor === undefined) {
				var source = sources.get(prop);
				var value = source?.v;
				if (source !== undefined && value !== UNINITIALIZED) {
					return {
						enumerable: true,
						configurable: true,
						value,
						writable: true
					};
				}
			}
			return descriptor;
		},
		has(target, prop) {
			if (prop === STATE_SYMBOL) {
				return true;
			}
			var s = sources.get(prop);
			var has = (s !== undefined && s.v !== UNINITIALIZED) || Reflect.has(target, prop);
			if (
				s !== undefined ||
				(active_effect !== null && (!has || get_descriptor(target, prop)?.writable))
			) {
				if (s === undefined) {
					s = with_parent(() => {
						var p = has ? proxy(target[prop]) : UNINITIALIZED;
						var s = state(p);
						return s;
					});
					sources.set(prop, s);
				}
				var value = get(s);
				if (value === UNINITIALIZED) {
					return false;
				}
			}
			return has;
		},
		set(target, prop, value, receiver) {
			var s = sources.get(prop);
			var has = prop in target;
			if (is_proxied_array && prop === 'length') {
				for (var i = value; i <  (s).v; i += 1) {
					var other_s = sources.get(i + '');
					if (other_s !== undefined) {
						set(other_s, UNINITIALIZED);
					} else if (i in target) {
						other_s = with_parent(() => state(UNINITIALIZED));
						sources.set(i + '', other_s);
					}
				}
			}
			if (s === undefined) {
				if (!has || get_descriptor(target, prop)?.writable) {
					s = with_parent(() => state(undefined));
					set(s, proxy(value));
					sources.set(prop, s);
				}
			} else {
				has = s.v !== UNINITIALIZED;
				var p = with_parent(() => proxy(value));
				set(s, p);
			}
			var descriptor = Reflect.getOwnPropertyDescriptor(target, prop);
			if (descriptor?.set) {
				descriptor.set.call(receiver, value);
			}
			if (!has) {
				if (is_proxied_array && typeof prop === 'string') {
					var ls =  (sources.get('length'));
					var n = Number(prop);
					if (Number.isInteger(n) && n >= ls.v) {
						set(ls, n + 1);
					}
				}
				increment(version);
			}
			return true;
		},
		ownKeys(target) {
			get(version);
			var own_keys = Reflect.ownKeys(target).filter((key) => {
				var source = sources.get(key);
				return source === undefined || source.v !== UNINITIALIZED;
			});
			for (var [key, source] of sources) {
				if (source.v !== UNINITIALIZED && !(key in target)) {
					own_keys.push(key);
				}
			}
			return own_keys;
		},
		setPrototypeOf() {
			state_prototype_fixed();
		}
	});
}

export { proxy };
