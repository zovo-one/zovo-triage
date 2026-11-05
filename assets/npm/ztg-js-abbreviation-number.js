import { __exports as dist } from '../_virtual/ztg-index3.js';
import { __require as requireAbbreviateNumber } from './ztg-js-abbreviation-number-abbreviateNumber.js';
import { __require as requireUnabbreviateNumber } from './ztg-js-abbreviation-number-unabbreviateNumber.js';

var hasRequiredDist;
function requireDist () {
	if (hasRequiredDist) return dist;
	hasRequiredDist = 1;
	(function (exports) {
		function __export(m) {
		    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
		}
		Object.defineProperty(exports, "__esModule", { value: true });
		__export(requireAbbreviateNumber());
		__export(requireUnabbreviateNumber());
	} (dist));
	return dist;
}

export { requireDist as __require };
