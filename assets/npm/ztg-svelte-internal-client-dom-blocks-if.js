import { EFFECT_TRANSPARENT } from './ztg-svelte-internal-client-constants.js';
import { hydrating, hydrate_next, read_hydration_instruction, skip_nodes, set_hydrate_node, set_hydrating, hydrate_node } from './ztg-svelte-internal-client-dom-hydration.js';
import { block } from './ztg-svelte-internal-client-reactivity-effects.js';
import { BranchManager } from './ztg-svelte-internal-client-dom-blocks-branches.js';

function if_block(node, fn, elseif = false) {
	var marker;
	if (hydrating) {
		marker = hydrate_node;
		hydrate_next();
	}
	var branches = new BranchManager(node);
	var flags = elseif ? EFFECT_TRANSPARENT : 0;
	function update_branch(key, fn) {
		if (hydrating) {
			var data = read_hydration_instruction( (marker));
			if (key !== parseInt(data.substring(1))) {
				var anchor = skip_nodes();
				set_hydrate_node(anchor);
				branches.anchor = anchor;
				set_hydrating(false);
				branches.ensure(key, fn);
				set_hydrating(true);
				return;
			}
		}
		branches.ensure(key, fn);
	}
	block(() => {
		var has_branch = false;
		fn((fn, key = 0) => {
			has_branch = true;
			update_branch(key, fn);
		});
		if (!has_branch) {
			update_branch(-1, null);
		}
	}, flags);
}

export { if_block };
