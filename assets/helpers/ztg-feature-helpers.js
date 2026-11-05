const shortcutMap = new Map();

const getFeatureId = (url) => url.split('/').pop().split('.', 1)[0] ;












function getIdentifiers(url) {
	const id = getFeatureId(url);
	return {
		id,
		class: 'rgh-' + id,
		selector: '.rgh-' + id,
	};
}

function noop() {/* empty */}

const httpLog = console.log.bind(console, '🌏');

const log = {
	info: console.log,
	http: httpLog,
	setup({logging, logHttp}) {
		log.info = logging ? console.log : noop;
		log.http = logHttp ? httpLog : noop;
	},
};

let isInitialLoadValue = true;

function isInitialLoad() {
	return isInitialLoadValue;
}

function markAjaxedLoad() {
	isInitialLoadValue = false;
}

function listenToAjaxedLoad() {
	document.addEventListener('soft-nav:start', markAjaxedLoad, {once: true});
	document.addEventListener('pjax:start', markAjaxedLoad, {once: true});
}

export { getFeatureId, getIdentifiers, isInitialLoad, listenToAjaxedLoad, log, markAjaxedLoad, shortcutMap };
