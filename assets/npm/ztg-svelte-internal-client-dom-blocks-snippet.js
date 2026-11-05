import { EFFECT_TRANSPARENT } from './ztg-svelte-internal-client-constants.js';
import { block } from './ztg-svelte-internal-client-reactivity-effects.js';
import './ztg-svelte-internal-client-dom-reconciler.js';
import { BranchManager } from './ztg-svelte-internal-client-dom-blocks-branches.js';

function snippet(node, get_snippet, ...args) {
	var branches = new BranchManager(node);
	block(() => {
		const snippet = get_snippet() ?? null;
		branches.ensure(snippet, snippet && ((anchor) => snippet(anchor, ...args)));
	}, EFFECT_TRANSPARENT);
}

export { snippet };
