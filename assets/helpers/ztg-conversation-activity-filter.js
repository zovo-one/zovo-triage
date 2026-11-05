import { onAbort } from '../npm/ztg-abort-utils-on-abort.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { writable } from '../npm/ztg-svelte-store-shared.js';

const states = {
	showAll: 'Show all activities',
	hideEvents: 'Hide events',
	hideAllNoise: 'Hide events, bots, collapsed comments',
} ;

 

const defaults = new Map([
	['/refined-github/refined-github/issues/7000', 'hideAllNoise'],
	['/refined-github/refined-github/issues/8000', 'hideAllNoise'],
]);

function sessionKey(pathname) {
	return `rgh-conversation-activity-filter-state:${pathname}`;
}

function getInitialStateForUrl(pathname) {
	const initialState = sessionStorage.getItem(sessionKey(pathname))
		?? defaults.get(pathname)
		?? 'showAll';
	return initialState ;
}

// Internal state used so that the state can be updated/reset on `init` without immediately saving it to the storage
const {subscribe, set: internalSet} = writable(
	getInitialStateForUrl(location.pathname),
);

const activityFilterState = {
	subscribe,
	set(value) {
		sessionStorage.setItem(sessionKey(location.pathname), value);
		internalSet(value);
	},
};

function syncWrapper(
	wrapper,
	{signal},
) {
	const unsubscribe = activityFilterState.subscribe((value) => {
		wrapper.setAttribute('data-rgh-conversation-activity-filter', value);
	});
	onAbort(signal, unsubscribe);
}

function fetchStateForCurrentUrl() {
	internalSet(getInitialStateForUrl(location.pathname));
}

export { activityFilterState, fetchStateForCurrentUrl, states, syncWrapper };
