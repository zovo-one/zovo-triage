import { get, untrack } from './ztg-svelte-internal-client-runtime.js';
import { effect_tracking, render_effect } from './ztg-svelte-internal-client-reactivity-effects.js';
import { source, increment } from './ztg-svelte-internal-client-reactivity-sources.js';
import './ztg-svelte-internal-client-constants.js';
import { queue_micro_task } from './ztg-svelte-internal-client-dom-task.js';

function createSubscriber(start) {
	let subscribers = 0;
	let version = source(0);
	let stop;
	return () => {
		if (effect_tracking()) {
			get(version);
			render_effect(() => {
				if (subscribers === 0) {
					stop = untrack(() => start(() => increment(version)));
				}
				subscribers += 1;
				return () => {
					queue_micro_task(() => {
						subscribers -= 1;
						if (subscribers === 0) {
							stop?.();
							stop = undefined;
							increment(version);
						}
					});
				};
			});
		}
	};
}

export { createSubscriber };
