const objectToString = Object.prototype.toString;
const uint8ArrayStringified = '[object Uint8Array]';
function isType(value, typeConstructor, typeStringified) {
	if (!value) {
		return false;
	}
	if (value.constructor === typeConstructor) {
		return true;
	}
	return objectToString.call(value) === typeStringified;
}
function isUint8Array(value) {
	return isType(value, Uint8Array, uint8ArrayStringified);
}
function assertUint8Array(value) {
	if (!isUint8Array(value)) {
		throw new TypeError(`Expected \`Uint8Array\`, got \`${typeof value}\``);
	}
}
({
	utf8: new globalThis.TextDecoder('utf8'),
});
function assertString(value) {
	if (typeof value !== 'string') {
		throw new TypeError(`Expected \`string\`, got \`${typeof value}\``);
	}
}
const cachedEncoder = new globalThis.TextEncoder();
function stringToUint8Array(string) {
	assertString(string);
	return cachedEncoder.encode(string);
}
function base64ToBase64Url(base64) {
	return base64.replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}
const MAX_BLOCK_SIZE = 65_535;
function uint8ArrayToBase64(array, {urlSafe = false} = {}) {
	assertUint8Array(array);
	let base64 = '';
	for (let index = 0; index < array.length; index += MAX_BLOCK_SIZE) {
		const chunk = array.subarray(index, index + MAX_BLOCK_SIZE);
		base64 += globalThis.btoa(String.fromCodePoint.apply(undefined, chunk));
	}
	return urlSafe ? base64ToBase64Url(base64) : base64;
}
function stringToBase64(string, {urlSafe = false} = {}) {
	assertString(string);
	return uint8ArrayToBase64(stringToUint8Array(string), {urlSafe});
}
Array.from({length: 256}, (_, index) => index.toString(16).padStart(2, '0'));

export { assertUint8Array, isUint8Array, stringToBase64, stringToUint8Array, uint8ArrayToBase64 };
