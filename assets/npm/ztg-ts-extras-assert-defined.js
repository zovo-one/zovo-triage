import { isDefined } from './ztg-ts-extras-is-defined.js';

function assertDefined(value, message) {
    if (!isDefined(value)) {
        throw new TypeError(message ?? 'Expected a defined value, got `undefined`');
    }
}

export { assertDefined };
