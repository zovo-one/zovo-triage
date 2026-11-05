import { $ } from '../npm/ztg-select-dom.js';
import { frame } from '../helpers/ztg-dom-utils.js';

async function withMenuOpen(
	menuButton,
	callback,
) {
	menuButton.click();
	// Wait for the menu DOM to be created, but not rendered
	await frame();

	try {
		// When executing concurrently, there might be multiple menus open, so we find the one that is associated with the given button
		// If the button itself is labelled by another element, the menu will be labelled by that element too
		const menu = $([
			`ul[aria-labelledby="${menuButton.id}"]`,
			// This must be a double GitHub bug: the menu has the same "labelledby" as the `menuButton` itself.
			// Note: this selector will select `menuButton` itself if it lacks a tag name
			// https://github.com/refined-github/refined-github/issues/10003
			`ul[aria-labelledby="${menuButton.getAttribute('aria-labelledby')}"]`,
		]);
		const result = callback(menu);
		return result;
	} finally {
		menuButton.click();
	}
}

export { withMenuOpen as default };
