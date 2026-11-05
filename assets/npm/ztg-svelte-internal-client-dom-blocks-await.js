import { is_promise } from './ztg-svelte-internal-shared-utils.js';
import { block } from './ztg-svelte-internal-client-reactivity-effects.js';
import { source, mutable_source, internal_set } from './ztg-svelte-internal-client-reactivity-sources.js';
import { hydrating, hydrate_next, set_hydrate_node, skip_nodes, set_hydrating } from './ztg-svelte-internal-client-dom-hydration.js';
import { queue_micro_task } from './ztg-svelte-internal-client-dom-task.js';
import { UNINITIALIZED, HYDRATION_START_ELSE } from './ztg-svelte-constants.js';
import { is_runes } from './ztg-svelte-internal-client-context.js';
import { current_batch, Batch, is_flushing_sync, flushSync } from './ztg-svelte-internal-client-reactivity-batch.js';
import { BranchManager } from './ztg-svelte-internal-client-dom-blocks-branches.js';
import { unset_context, capture } from './ztg-svelte-internal-client-reactivity-async.js';

const PENDING = 0;
const THEN = 1;
const CATCH = 2;
function await_block(node, get_input, pending_fn, then_fn, catch_fn) {
	if (hydrating) {
		hydrate_next();
	}
	var runes = is_runes();
	var v =  (UNINITIALIZED);
	var value = runes ? source(v) : mutable_source(v, false, false);
	var error = runes ? source(v) : mutable_source(v, false, false);
	var branches = new BranchManager(node);
	block(() => {
		var batch =  (current_batch);
		var input = get_input();
		var destroyed = false;
		let mismatch = hydrating && is_promise(input) === (node.data === HYDRATION_START_ELSE);
		if (mismatch) {
			set_hydrate_node(skip_nodes());
			set_hydrating(false);
		}
		if (is_promise(input)) {
			var restore = capture();
			var resolved = false;
			const resolve = (fn) => {
				if (destroyed) return;
				resolved = true;
				restore(false);
				if (current_batch === batch) {
					batch.deactivate();
				}
				Batch.ensure();
				try {
					fn();
				} finally {
					unset_context(false);
					if (!is_flushing_sync) flushSync();
				}
			};
			input.then(
				(v) => {
					resolve(() => {
						internal_set(value, v);
						branches.ensure(THEN, then_fn && ((target) => then_fn(target, value)));
					});
				},
				(e) => {
					resolve(() => {
						internal_set(error, e);
						branches.ensure(CATCH, catch_fn && ((target) => catch_fn(target, error)));
						if (!catch_fn) {
							throw error.v;
						}
					});
				}
			);
			if (hydrating) {
				branches.ensure(PENDING, pending_fn);
			} else {
				queue_micro_task(() => {
					if (!resolved) {
						resolve(() => {
							branches.ensure(PENDING, pending_fn);
						});
					}
				});
			}
		} else {
			internal_set(value, input);
			branches.ensure(THEN, then_fn && ((target) => then_fn(target, value)));
		}
		if (mismatch) {
			set_hydrating(true);
		}
		return () => {
			destroyed = true;
		};
	});
}

export { await_block };
