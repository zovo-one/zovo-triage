import { clsx as clsx$1 } from './ztg-clsx-clsx.js';

function clsx(value) {
	if (typeof value === 'object') {
		return clsx$1(value);
	} else {
		return value ?? '';
	}
}
const whitespace = [...' \t\n\r\f\u00a0\u000b\ufeff'];
function to_class(value, hash, directives) {
	var classname = value == null ? '' : '' + value;
	if (hash) {
		classname = classname ? classname + ' ' + hash : hash;
	}
	if (directives) {
		for (var key of Object.keys(directives)) {
			if (directives[key]) {
				classname = classname ? classname + ' ' + key : key;
			} else if (classname.length) {
				var len = key.length;
				var a = 0;
				while ((a = classname.indexOf(key, a)) >= 0) {
					var b = a + len;
					if (
						(a === 0 || whitespace.includes(classname[a - 1])) &&
						(b === classname.length || whitespace.includes(classname[b]))
					) {
						classname = (a === 0 ? '' : classname.substring(0, a)) + classname.substring(b + 1);
					} else {
						a = b;
					}
				}
			}
		}
	}
	return classname === '' ? null : classname;
}
function append_styles(styles, important = false) {
	var separator = important ? ' !important;' : ';';
	var css = '';
	for (var key of Object.keys(styles)) {
		var value = styles[key];
		if (value != null && value !== '') {
			css += ' ' + key + ': ' + value + separator;
		}
	}
	return css;
}
function to_style(value, styles) {
	if (styles) {
		var new_style = '';
		var normal_styles;
		var important_styles;
		if (Array.isArray(styles)) {
			normal_styles = styles[0];
			important_styles = styles[1];
		} else {
			normal_styles = styles;
		}
		if (normal_styles) {
			new_style += append_styles(normal_styles);
		}
		if (important_styles) {
			new_style += append_styles(important_styles, true);
		}
		new_style = new_style.trim();
		return new_style === '' ? null : new_style;
	}
	return String(value);
}

export { clsx, to_class, to_style };
