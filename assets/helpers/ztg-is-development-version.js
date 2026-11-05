const {version} = chrome.runtime.getManifest();

function isDevelopmentVersion() {
	return version === '0.0.0';
}

export { isDevelopmentVersion as default };
