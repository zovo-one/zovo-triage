/**
Wrap an initialization function so only its latest invocation remains active.

Like React's `useEffect`, the previous cleanup function is called before
`init` is invoked again.
*/
function singleton(init) {
	let unmount;

	return ((...arguments_) => {
		if (typeof unmount === 'function') {
			unmount();
		}

		unmount = init(...arguments_);
	}) ;
}

export { singleton as default };
