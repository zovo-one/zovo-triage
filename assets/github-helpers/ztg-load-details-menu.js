import oneEvent from '../npm/ztg-one-event.js';
import { $optional } from '../npm/ztg-select-dom.js';

async function loadDetailsMenu(detailsMenu) {
	const fragment = $optional('.js-comment-header-actions-deferred-include-fragment', detailsMenu);
	if (!fragment) {
		return;
	}

	detailsMenu.parentElement.dispatchEvent(new Event('mouseover'));
	await oneEvent(fragment, 'load');
}

export { loadDetailsMenu as default };
