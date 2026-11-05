import { __exports as utils } from '../_virtual/ztg-utils.js';

var hasRequiredUtils;
function requireUtils () {
	if (hasRequiredUtils) return utils;
	hasRequiredUtils = 1;
	Object.defineProperty(utils, "__esModule", { value: true });
	utils.symbolPow = function (index) {
	    if (index === void 0) { index = 0; }
	    return Math.pow(10, index * 3);
	};
	return utils;
}

export { requireUtils as __require };
