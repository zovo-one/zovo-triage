const { toString } = Object.prototype;
function describeValue(value) {
    try {
        return JSON.stringify(value);
    }
    catch {
        try {
            return String(value);
        }
        catch {
            try {
                return toString.call(value);
            }
            catch {
                return '<Unprintable value>';
            }
        }
    }
}
function assertError(value, message) {
    if (value instanceof Error || toString.call(value) === '[object Error]') {
        return;
    }
    throw new TypeError(`Expected an Error, got ${toString.call(value)} (${typeof value}) → ${describeValue(value)}`);
}

export { assertError };
