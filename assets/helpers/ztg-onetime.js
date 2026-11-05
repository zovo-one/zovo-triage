const notRun = Symbol('false');
function onetime(
	function_,
) {
	let returnValue = notRun;
	return function( ...arguments_) {
		if (returnValue !== notRun) {
			return returnValue;
		}

		returnValue = Reflect.apply(function_, this, arguments_);
		return returnValue;
	};
}

export { onetime as default };
