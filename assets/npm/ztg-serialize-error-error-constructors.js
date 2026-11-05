const list = [
	EvalError,
	RangeError,
	ReferenceError,
	SyntaxError,
	TypeError,
	URIError,
	globalThis.DOMException,
	globalThis.AssertionError,
	globalThis.SystemError,
]
	.filter(Boolean)
	.map(
		constructor => [constructor.name, constructor],
	);
const errorConstructors = new Map(list);

export { errorConstructors as default };
