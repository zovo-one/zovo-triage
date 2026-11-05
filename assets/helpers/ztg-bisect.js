import React from '../npm/ztg-dom-chef.js';
import elementReady from '../npm/ztg-element-ready.js';
import { $optional, $$ } from '../npm/ztg-select-dom.js';
import '../npm/ztg-webext-storage-cache.js';
import { importedFeatures } from '../ztg-feature-data.js';
import { perDomainOptions } from '../ztg-options-storage.js';
import pluralize from './ztg-pluralize.js';
import { getFeatureUrl } from './ztg-rgh-links.js';
import CachedValue from '../npm/ztg-webext-storage-cache-cached-value.js';

const state = new CachedValue('bisect', {maxAge: {minutes: 15}});

async function startFeatureIdentification(origin) {
	const options = await perDomainOptions.getOptionsForOrigin(origin).getAll();
	const enabledFeatures = importedFeatures.filter(featureId => options[`feature:${featureId}`]);
	await state.set(enabledFeatures);
}

function enableButtons() {
	for (const button of $$('#rgh-bisect-dialog [aria-disabled]')) {
		button.removeAttribute('aria-disabled');
	}
}

// Split current list of features in half and create an options-like object to be applied on load
// Bisecting 4 features: enable 2
// Bisecting 3 features: enable 1
// Bisecting 2 features: enable 1
// Bisecting 1 feature: enable 0 // This is the last step, if the user says Yes, it's not caused by a JS feature
const getMiddleStep = (list) => Math.floor(list.length / 2);

async function onEndButtonClick() {
	await state.delete();
	location.reload();
}

function createMessageBox(message, extraButtons) {
	$optional('#rgh-bisect-dialog')?.remove();
	document.body.append(
		React.createElement('div', { id: "rgh-bisect-dialog", className: "Box p-3 tmp-p-3"  ,}
, React.createElement('p', null, message)
, React.createElement('div', { className: "d-flex flex-justify-between" ,}
, React.createElement('button', { type: "button", className: "btn", onClick: onEndButtonClick,}, "Exit")
, extraButtons
)
),
	);
}

async function hideMessage() {
	if (!(await state.get())) {
		createMessageBox('Process completed in another tab');
	}
}

async function onChoiceButtonClick({currentTarget: button}) {
	const answer = button.value;
	const bisectedFeatures = (await state.get());

	if (bisectedFeatures.length > 1) {
		await state.set(
			answer === 'yes'
				? bisectedFeatures.slice(0, getMiddleStep(bisectedFeatures))
				: bisectedFeatures.slice(getMiddleStep(bisectedFeatures)),
		);

		button.parentElement.replaceWith(React.createElement('div', { className: "btn", 'aria-disabled': "true",}, "Reloading…"));
		location.reload();
		return;
	}

	// Last step, no JS feature was enabled
	if (answer === 'yes') {
		createMessageBox(
			React.createElement(React.Fragment, null
, React.createElement('p', null, "Unable to identify feature. It might be a CSS-only feature, a"
          , ' '
, React.createElement('a', { href: "https://github.com/refined-github/refined-github/wiki/Meta-features", target: "_blank", rel: "noreferrer",}, "meta-feature"

), ", or unrelated to Refined GitHub."
)
, React.createElement('p', null, "Try disabling Refined GitHub to see if the change or issue is caused by the extension."               )
),
		);
	} else {
		const feature = (
			React.createElement('a', { href: getFeatureUrl(bisectedFeatures[0]),}
, React.createElement('code', null, bisectedFeatures[0])
)
		);

		createMessageBox(React.createElement(React.Fragment, null, "The change or issue is caused by "       , feature, "."));
	}

	await state.delete();
	globalThis.removeEventListener('visibilitychange', hideMessage);
}

async function bisectFeatures() {
	// `bisect` stores the list of features to be split in half
	const bisectedFeatures = await state.get();
	if (!bisectedFeatures) {
		return;
	}

	console.log(`Bisecting ${bisectedFeatures.length} features:\n${bisectedFeatures.join('\n')}`);

	const steps = Math.ceil(Math.log2(Math.max(bisectedFeatures.length))) + 1;
	await elementReady('body');
	createMessageBox(
		`Do you see the change or issue? (${pluralize(steps, 'last step', '$$ steps remaining')})`,
		React.createElement('div', null
, React.createElement('button', {
				type: "button",
				className: "btn btn-danger mr-2 tmp-mr-2"   ,
				value: "no",
				'aria-disabled': "true",
				onClick: onChoiceButtonClick,}
, "No"

)
, React.createElement('button', { type: "button", className: "btn btn-primary" , value: "yes", 'aria-disabled': "true", onClick: onChoiceButtonClick,}, "Yes"

)
),
	);

	// Enable "Yes"/"No" buttons once the page is done loading
	if (document.readyState === 'complete') {
		enableButtons();
	} else {
		window.addEventListener('load', enableButtons);
	}

	// Hide message when the process is done elsewhere
	globalThis.addEventListener('visibilitychange', hideMessage);

	const half = getMiddleStep(bisectedFeatures);
	const temporaryOptions = {};
	for (const feature of importedFeatures) {
		const index = bisectedFeatures.indexOf(feature);
		temporaryOptions[`feature:${feature}`] = index !== -1 && index < half;
	}

	console.log({temporaryOptions});
	return temporaryOptions;
}

export { bisectFeatures as default, startFeatureIdentification, state };
