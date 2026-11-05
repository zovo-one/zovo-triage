var is_array = Array.isArray;
var index_of = Array.prototype.indexOf;
var includes = Array.prototype.includes;
var array_from = Array.from;
var object_keys = Object.keys;
var define_property = Object.defineProperty;
var get_descriptor = Object.getOwnPropertyDescriptor;
var get_descriptors = Object.getOwnPropertyDescriptors;
var object_prototype = Object.prototype;
var array_prototype = Array.prototype;
var get_prototype_of = Object.getPrototypeOf;
var is_extensible = Object.isExtensible;
const noop = () => {};
function is_promise(value) {
	return typeof value?.then === 'function';
}
function run(fn) {
	return fn();
}
function run_all(arr) {
	for (var i = 0; i < arr.length; i++) {
		arr[i]();
	}
}
function deferred() {
	var resolve;
	var reject;
	var promise = new Promise((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
}
function to_array(value, n) {
	if (Array.isArray(value)) {
		return value;
	}
	if (!(Symbol.iterator in value)) {
		return Array.from(value);
	}
	const array = [];
	for (const element of value) {
		array.push(element);
		if (array.length === n) break;
	}
	return array;
}

export { array_from, array_prototype, deferred, define_property, get_descriptor, get_descriptors, get_prototype_of, includes, index_of, is_array, is_extensible, is_promise, noop, object_keys, object_prototype, run, run_all, to_array };
