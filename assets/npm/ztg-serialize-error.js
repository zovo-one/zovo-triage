import errorConstructors from './ztg-serialize-error-error-constructors.js';

class NonError extends Error {
	name = 'NonError';
	constructor(message) {
		super(NonError._prepareSuperMessage(message));
	}
	static _prepareSuperMessage(message) {
		try {
			return JSON.stringify(message);
		} catch {
			return String(message);
		}
	}
}
const commonProperties = [
	{
		property: 'name',
		enumerable: false,
	},
	{
		property: 'message',
		enumerable: false,
	},
	{
		property: 'stack',
		enumerable: false,
	},
	{
		property: 'code',
		enumerable: true,
	},
	{
		property: 'cause',
		enumerable: false,
	},
];
const toJsonWasCalled = new WeakSet();
const toJSON = from => {
	toJsonWasCalled.add(from);
	const json = from.toJSON();
	toJsonWasCalled.delete(from);
	return json;
};
const getErrorConstructor = name => errorConstructors.get(name) ?? Error;
const destroyCircular = ({
	from,
	seen,
	to,
	forceEnumerable,
	maxDepth,
	depth,
	useToJSON,
	serialize,
}) => {
	if (!to) {
		if (Array.isArray(from)) {
			to = [];
		} else if (!serialize && isErrorLike(from)) {
			const Error = getErrorConstructor(from.name);
			to = new Error();
		} else {
			to = {};
		}
	}
	seen.push(from);
	if (depth >= maxDepth) {
		return to;
	}
	if (useToJSON && typeof from.toJSON === 'function' && !toJsonWasCalled.has(from)) {
		return toJSON(from);
	}
	const continueDestroyCircular = value => destroyCircular({
		from: value,
		seen: [...seen],
		forceEnumerable,
		maxDepth,
		depth,
		useToJSON,
		serialize,
	});
	for (const [key, value] of Object.entries(from)) {
		if (value && value instanceof Uint8Array && value.constructor.name === 'Buffer') {
			to[key] = '[object Buffer]';
			continue;
		}
		if (value !== null && typeof value === 'object' && typeof value.pipe === 'function') {
			to[key] = '[object Stream]';
			continue;
		}
		if (typeof value === 'function') {
			continue;
		}
		if (!value || typeof value !== 'object') {
			try {
				to[key] = value;
			} catch {}
			continue;
		}
		if (!seen.includes(from[key])) {
			depth++;
			to[key] = continueDestroyCircular(from[key]);
			continue;
		}
		to[key] = '[Circular]';
	}
	for (const {property, enumerable} of commonProperties) {
		if (typeof from[property] !== 'undefined' && from[property] !== null) {
			Object.defineProperty(to, property, {
				value: isErrorLike(from[property]) ? continueDestroyCircular(from[property]) : from[property],
				enumerable: forceEnumerable ? true : enumerable,
				configurable: true,
				writable: true,
			});
		}
	}
	return to;
};
function serializeError(value, options = {}) {
	const {
		maxDepth = Number.POSITIVE_INFINITY,
		useToJSON = true,
	} = options;
	if (typeof value === 'object' && value !== null) {
		return destroyCircular({
			from: value,
			seen: [],
			forceEnumerable: true,
			maxDepth,
			depth: 0,
			useToJSON,
			serialize: true,
		});
	}
	if (typeof value === 'function') {
		return `[Function: ${value.name || 'anonymous'}]`;
	}
	return value;
}
function deserializeError(value, options = {}) {
	const {maxDepth = Number.POSITIVE_INFINITY} = options;
	if (value instanceof Error) {
		return value;
	}
	if (isMinimumViableSerializedError(value)) {
		const Error = getErrorConstructor(value.name);
		return destroyCircular({
			from: value,
			seen: [],
			to: new Error(),
			maxDepth,
			depth: 0,
			serialize: false,
		});
	}
	return new NonError(value);
}
function isErrorLike(value) {
	return Boolean(value)
	&& typeof value === 'object'
	&& 'name' in value
	&& 'message' in value
	&& 'stack' in value;
}
function isMinimumViableSerializedError(value) {
	return Boolean(value)
	&& typeof value === 'object'
	&& 'message' in value
	&& !Array.isArray(value);
}

export { NonError, deserializeError, errorConstructors, isErrorLike, serializeError };
