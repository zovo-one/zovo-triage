import { __exports as unabbreviateNumber } from '../_virtual/ztg-unabbreviateNumber.js';
import { __require as require_const } from './ztg-js-abbreviation-number-const.js';
import { __require as requireUtils } from './ztg-js-abbreviation-number-utils.js';

var hasRequiredUnabbreviateNumber;
function requireUnabbreviateNumber () {
	if (hasRequiredUnabbreviateNumber) return unabbreviateNumber;
	hasRequiredUnabbreviateNumber = 1;
	Object.defineProperty(unabbreviateNumber, "__esModule", { value: true });
	var const_1 = require_const();
	var utils_1 = requireUtils();
	function unabbreviateNumber$1(num, symbols) {
	    if (symbols === void 0) { symbols = const_1.defaultSymbols; }
	    var numberPattern = "[+-]?([0-9]*[.])?[0-9]+";
	    var symbolPattern = "" + symbols.join("|");
	    var pattern = "^(" + numberPattern + ")(" + symbolPattern + ")$";
	    var regex = new RegExp(pattern);
	    var match = num.match(pattern) || [];
	    if (regex.test(num) && match.length > 3) {
	        var symbol = match[3];
	        var symbolValue = utils_1.symbolPow(symbols.indexOf(symbol));
	        var pureNum = Number(match[1]);
	        return pureNum * symbolValue;
	    }
	    else {
	        throw Error("This is not a valid input");
	    }
	}
	unabbreviateNumber.unabbreviateNumber = unabbreviateNumber$1;
	return unabbreviateNumber;
}

export { requireUnabbreviateNumber as __require };
