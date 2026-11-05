async function delay(ms, signal) {
	await new Promise((resolve, reject) => {
		setTimeout(resolve, ms);
	});
}

export { delay as default };
