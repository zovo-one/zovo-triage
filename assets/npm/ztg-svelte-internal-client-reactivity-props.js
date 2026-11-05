import { PROPS_IS_UPDATED, PROPS_IS_IMMUTABLE, PROPS_IS_BINDABLE, PROPS_IS_RUNES, PROPS_IS_LAZY_INITIAL } from './ztg-svelte-constants.js';
import { get_descriptor } from './ztg-svelte-internal-shared-utils.js';
import { set } from './ztg-svelte-internal-client-reactivity-sources.js';
import { derived, derived_safe_equal } from './ztg-svelte-internal-client-reactivity-deriveds.js';
import { get, active_effect, is_destroying_effect, untrack } from './ztg-svelte-internal-client-runtime.js';
import { props_invalid_value } from './ztg-svelte-internal-client-errors.js';
import { DESTROYED, STATE_SYMBOL, LEGACY_PROPS } from './ztg-svelte-internal-client-constants.js';
import { proxy } from './ztg-svelte-internal-client-proxy.js';
import { capture_store_binding } from './ztg-svelte-internal-client-reactivity-store.js';
import { legacy_mode_flag } from './ztg-svelte-internal-flags.js';

const rest_props_handler = {
	get(target, key) {
		if (target.exclude.has(key)) return;
		return target.props[key];
	},
	set(target, key) {
		return false;
	},
	getOwnPropertyDescriptor(target, key) {
		if (target.exclude.has(key)) return;
		if (key in target.props) {
			return {
				enumerable: true,
				configurable: true,
				value: target.props[key]
			};
		}
	},
	has(target, key) {
		if (target.exclude.has(key)) return false;
		return key in target.props;
	},
	ownKeys(target) {
		return Reflect.ownKeys(target.props).filter((key) => !target.exclude.has(key));
	}
};
function rest_props(props, exclude, name) {
	return new Proxy({ props, exclude }, rest_props_handler);
}
function prop(props, key, flags, fallback) {
	var runes = !legacy_mode_flag || (flags & PROPS_IS_RUNES) !== 0;
	var bindable = (flags & PROPS_IS_BINDABLE) !== 0;
	var lazy = (flags & PROPS_IS_LAZY_INITIAL) !== 0;
	var fallback_value =  (fallback);
	var fallback_dirty = true;
	var fallback_signal =  (undefined);
	var get_fallback = () => {
		if (lazy && runes) {
			fallback_signal ??= derived( (fallback));
			return get(fallback_signal);
		}
		if (fallback_dirty) {
			fallback_dirty = false;
			fallback_value = lazy
				? untrack( (fallback))
				:  (fallback);
		}
		return fallback_value;
	};
	let setter;
	if (bindable) {
		var is_entry_props = STATE_SYMBOL in props || LEGACY_PROPS in props;
		setter =
			get_descriptor(props, key)?.set ??
			(is_entry_props && key in props ? (v) => (props[key] = v) : undefined);
	}
	var initial_value;
	var is_store_sub = false;
	if (bindable) {
		[initial_value, is_store_sub] = capture_store_binding(() =>  (props[key]));
	} else {
		initial_value =  (props[key]);
	}
	if (initial_value === undefined && fallback !== undefined) {
		initial_value = get_fallback();
		if (setter) {
			if (runes) props_invalid_value();
			setter(initial_value);
		}
	}
	var getter;
	if (runes) {
		getter = () => {
			var value =  (props[key]);
			if (value === undefined) return get_fallback();
			fallback_dirty = true;
			return value;
		};
	} else {
		getter = () => {
			var value =  (props[key]);
			if (value !== undefined) {
				fallback_value =  (undefined);
			}
			return value === undefined ? fallback_value : value;
		};
	}
	if (runes && (flags & PROPS_IS_UPDATED) === 0) {
		return getter;
	}
	if (setter) {
		var legacy_parent = props.$$legacy;
		return  (
			function ( value,  mutation) {
				if (arguments.length > 0) {
					if (!runes || !mutation || legacy_parent || is_store_sub) {
						 (setter)(mutation ? getter() : value);
					}
					return value;
				}
				return getter();
			}
		);
	}
	var overridden = false;
	var d = ((flags & PROPS_IS_IMMUTABLE) !== 0 ? derived : derived_safe_equal)(() => {
		overridden = false;
		return getter();
	});
	if (bindable) get(d);
	var parent_effect =  (active_effect);
	return  (
		function ( value,  mutation) {
			if (arguments.length > 0) {
				const new_value = mutation ? get(d) : runes && bindable ? proxy(value) : value;
				set(d, new_value);
				overridden = true;
				if (fallback_value !== undefined) {
					fallback_value = new_value;
				}
				return value;
			}
			if ((is_destroying_effect && overridden) || (parent_effect.f & DESTROYED) !== 0) {
				return d.v;
			}
			return get(d);
		}
	);
}

export { prop, rest_props };
