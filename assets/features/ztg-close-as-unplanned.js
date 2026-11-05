import delegate from '../npm/ztg-delegate-it-delegate.js';
import { isIssue } from '../npm/ztg-github-url-detection.js';
import { closestElement, $ } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import { getFeatureId } from '../helpers/ztg-feature-helpers.js';
import observe from '../helpers/ztg-selector-observer.js';

const id = getFeatureId(import.meta.url);

const unplannedCheckbox = 'input[name="state_reason"][value="not_planned"]';

function update(dropdown) {
	const form = closestElement('form', dropdown);
	const radio = $(unplannedCheckbox, dropdown);
	const mainButton = $('[name="comment_and_close"]', form);
	const icon = $('.octicon-skip', dropdown);

	const checkbox = radio.cloneNode();
	checkbox.hidden = true;
	checkbox.type = 'checkbox';

	mainButton.classList.add('tooltipped', 'tooltipped-nw');
	mainButton.setAttribute('aria-label', 'Done, closed, fixed, resolved');

	const unplannedButton = mainButton.cloneNode();
	unplannedButton.append(icon);
	unplannedButton.id = id;
	unplannedButton.classList.add('btn', 'tooltipped', 'tooltipped-nw', 'mr-0');
	// Prevent content from being changed #7024
	unplannedButton.classList.remove('js-comment-and-button');
	unplannedButton.setAttribute('aria-label', 'Close as not planned.\nWon’t fix, can’t repro, duplicate, stale');

	dropdown.replaceWith(unplannedButton);
	form.append(checkbox);
}

function updateCheckbox({delegateTarget: button}) {
	$(unplannedCheckbox, button.form).checked = button.id === id;
}

function init(signal) {
	observe('close-reason-selector .select-menu', update, {signal});
	delegate('[name="comment_and_close"]', 'click', updateCheckbox, {signal});
}

void features.add(import.meta.url, {
	include: [
		isIssue,
	],
	init,
});

/*

Test URLs: (any issue you can close)

https://github.com/refined-github/sandbox/issues/73

*/
