import { isWebPage } from '../npm/ztg-webext-detect.js';
import { messageRuntime } from '../npm/ztg-webext-msg.js';

async function fetchText({url, options}) {
	const response = await fetch(url, options);
	return response.ok
		? response.text()
		: ''; // Likely a 404. Either way the response isn't the CSS we expect #8142
}

async function webextFetch(url, options) {
	return isWebPage()
		// Firefox CSP issue: https://github.com/refined-github/refined-github/issues/8144
		? messageRuntime({fetchText: {url, options}})
		: fetchText({url, options});
}

export { fetchText, webextFetch };
