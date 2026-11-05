import { isSafari } from '../npm/ztg-webext-detect.js';
import isDevelopmentVersion from './ztg-is-development-version.js';

const {version} = chrome.runtime.getManifest();

// Safari updates are less frequent
const maxReleaseAgeInDays = isSafari() ? 60 : 30;

function wasReleasedLongAgo(releaseAgeInDays) {
	return releaseAgeInDays > maxReleaseAgeInDays;
}

function getExtensionReleaseDate() {
	if (isDevelopmentVersion()) {
		return new Date();
	}

	const [year, month, day] = version.split('.').map(Number);
	// Version format: YY.M.D (e.g., 25.3.10 = 2025-03-10)
	// Date constructor uses 0-based months
	return new Date(2000 + year, month - 1, day);
}

function toDaysAgo(releaseDate) {
	return Math.floor((Date.now() - releaseDate.getTime()) / (1000 * 60 * 60 * 24));
}

export { getExtensionReleaseDate, toDaysAgo, wasReleasedLongAgo };
