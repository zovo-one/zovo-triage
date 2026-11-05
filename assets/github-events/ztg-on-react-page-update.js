import { signalFromEvent } from '../npm/ztg-abort-utils-signal-from-event.js';

function onReactPageUpdate(
	callback,
	signal,
) {
	document.addEventListener('soft-nav:payload', () => {
		const unifiedSignal = AbortSignal.any([
			signal, // User-provided, likely Turbo page navigation event
			signalFromEvent(document, 'soft-nav:payload'), // A "React page"-specific page navigation event
		]);
		callback(unifiedSignal);
	}, {signal});
}

export { onReactPageUpdate as default };
