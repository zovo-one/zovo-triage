import { __exports as abbreviateNumber } from '../_virtual/ztg-abbreviateNumber.js';
import { __require as require_const } from './ztg-js-abbreviation-number-const.js';

var hasRequiredAbbreviateNumber;
function requireAbbreviateNumber () {
	if (hasRequiredAbbreviateNumber) return abbreviateNumber;
	hasRequiredAbbreviateNumber = 1;
	Object.defineProperty(abbreviateNumber, "__esModule", { value: true });
	var const_1 = require_const();
	var defaultOptions = {
	    padding: true,
	    symbols: const_1.defaultSymbols,
	};
	function abbreviateNumber$1(num, digit, options) {
	    if (digit === void 0) { digit = 1; }
	    if (Array.isArray(options)) {
	        options = { symbols: options };
	    }
	    var _a = Object.assign({}, defaultOptions, options), symbols = _a.symbols, padding = _a.padding;
	    var sign = Math.sign(num) >= 0;
	    num = Math.abs(num);
	    var tier = (Math.log10(num) / 3) | 0;
	    if (tier == 0)
	        return (!sign ? "-" : "") + num.toString();
	    var suffix = symbols[tier];
	    if (!suffix)
	        throw new RangeError();
	    var scale = Math.pow(10, tier * 3);
	    var scaled = num / scale;
	    var rounded = scaled.toFixed(digit);
	    if (!padding) {
	        rounded = String(Number(rounded));
	    }
	    return (!sign ? "-" : "") + rounded + suffix;
	}
	abbreviateNumber.abbreviateNumber = abbreviateNumber$1;
	return abbreviateNumber;
}

export { requireAbbreviateNumber as __require };
