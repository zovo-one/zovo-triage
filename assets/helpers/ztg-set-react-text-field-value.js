const nativeInputValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
// https://stackoverflow.com/a/46012210
function setReactInputValue(target, value) {
	nativeInputValueSetter.call(target, value);
	target.dispatchEvent(new Event('input', {bubbles: true}));
}

function setReactTextareaValue(target, value) {
	target.value = value;
	target.dispatchEvent(new Event('input', {bubbles: true}));
}

export { setReactInputValue, setReactTextareaValue };
