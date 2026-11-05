import { untrack } from './ztg-svelte-internal-client-runtime.js';
import { noop } from './ztg-svelte-internal-shared-utils.js';

function subscribe_to_store(store, run, invalidate) {
	if (store == null) {
		run(undefined);
		if (invalidate) invalidate(undefined);
		return noop;
	}
	const unsub = untrack(() =>
		store.subscribe(
			run,
			invalidate
		)
	);
	return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}

export { subscribe_to_store };
