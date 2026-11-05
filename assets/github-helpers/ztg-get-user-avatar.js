import { isEnterprise } from '../npm/ztg-github-url-detection.js';
import { $optional } from '../npm/ztg-select-dom.js';

function getUserAvatar(username, size) {
	let cleanName = username.replace('[bot]', '');

	if (/[^\w-]/.test(cleanName)) {
		throw new TypeError(`Expected a username, got ${cleanName}`);
	}

	// Find image on page. Saves a request and a redirect + add support for bots
	const existingAvatar = $optional([
		`[href="/${cleanName}" i] img`,
		`[href="/apps/${cleanName}" i] img`,
	]);
	if (existingAvatar) {
		return existingAvatar.src;
	}

	if (
		[
			'Copilot',
			'copilot-coding-agent-docs',
			'copilot-swe-agent',
		].includes(cleanName)
	) {
		cleanName = 'in/1143301';
	}

	// Bots don't have a /$username.png URL
	// Enterprise can only use /$username.png
	const isBot = username.endsWith('[bot]') || cleanName.includes('/');
	const url = !isBot || isEnterprise()
		// Use full URLs: https://github.com/refined-github/refined-github/issues/9571
		? `${location.origin}/${cleanName}.png`
		: `https://avatars.githubusercontent.com/${cleanName}`;
	// Why use a 2x size: https://github.com/refined-github/refined-github/pull/4973#discussion_r735133613
	return url + `?size=${size * 2}`;
}

export { getUserAvatar as default };
