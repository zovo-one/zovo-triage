import { isPresent } from './ztg-ts-extras-is-present.js';

function assertPresent(value, message) {
    if (!isPresent(value)) {
        throw new TypeError(`Expected a present value, got \`${value}\``);
    }
}

export { assertPresent };
