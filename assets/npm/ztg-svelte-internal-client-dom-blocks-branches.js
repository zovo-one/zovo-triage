import { current_batch } from './ztg-svelte-internal-client-reactivity-batch.js';
import { resume_effect, destroy_effect, pause_effect, branch, move_effect } from './ztg-svelte-internal-client-reactivity-effects.js';
import './ztg-svelte-internal-client-constants.js';
import { hydrating, hydrate_node } from './ztg-svelte-internal-client-dom-hydration.js';
import { create_text, should_defer_append } from './ztg-svelte-internal-client-dom-operations.js';

class BranchManager {
	anchor;
	#batches = new Map();
	#onscreen = new Map();
	#offscreen = new Map();
	#outroing = new Set();
	#transition = true;
	constructor(anchor, transition = true) {
		this.anchor = anchor;
		this.#transition = transition;
	}
	#commit = (batch) => {
		if (!this.#batches.has(batch)) return;
		var key =  (this.#batches.get(batch));
		var onscreen = this.#onscreen.get(key);
		if (onscreen) {
			resume_effect(onscreen);
			this.#outroing.delete(key);
		} else {
			var offscreen = this.#offscreen.get(key);
			if (offscreen) {
				resume_effect(offscreen.effect);
				this.#onscreen.set(key, offscreen.effect);
				this.#offscreen.delete(key);
				 (offscreen.fragment.lastChild).remove();
				this.anchor.before(offscreen.fragment);
				onscreen = offscreen.effect;
			}
		}
		for (const [b, k] of this.#batches) {
			this.#batches.delete(b);
			if (b === batch) {
				break;
			}
			const offscreen = this.#offscreen.get(k);
			if (offscreen) {
				destroy_effect(offscreen.effect);
				this.#offscreen.delete(k);
			}
		}
		for (const [k, effect] of this.#onscreen) {
			if (k === key || this.#outroing.has(k)) continue;
			const on_destroy = () => {
				const keys = Array.from(this.#batches.values());
				if (keys.includes(k)) {
					var fragment = document.createDocumentFragment();
					move_effect(effect, fragment);
					fragment.append(create_text());
					this.#offscreen.set(k, { effect, fragment });
				} else {
					destroy_effect(effect);
				}
				this.#outroing.delete(k);
				this.#onscreen.delete(k);
			};
			if (this.#transition || !onscreen) {
				this.#outroing.add(k);
				pause_effect(effect, on_destroy, false);
			} else {
				on_destroy();
			}
		}
	};
	#discard = (batch) => {
		this.#batches.delete(batch);
		const keys = Array.from(this.#batches.values());
		for (const [k, branch] of this.#offscreen) {
			if (!keys.includes(k)) {
				destroy_effect(branch.effect);
				this.#offscreen.delete(k);
			}
		}
	};
	ensure(key, fn) {
		var batch =  (current_batch);
		var defer = should_defer_append();
		if (fn && !this.#onscreen.has(key) && !this.#offscreen.has(key)) {
			if (defer) {
				var fragment = document.createDocumentFragment();
				var target = create_text();
				fragment.append(target);
				this.#offscreen.set(key, {
					effect: branch(() => fn(target)),
					fragment
				});
			} else {
				this.#onscreen.set(
					key,
					branch(() => fn(this.anchor))
				);
			}
		}
		this.#batches.set(batch, key);
		if (defer) {
			for (const [k, effect] of this.#onscreen) {
				if (k === key) {
					batch.unskip_effect(effect);
				} else {
					batch.skip_effect(effect);
				}
			}
			for (const [k, branch] of this.#offscreen) {
				if (k === key) {
					batch.unskip_effect(branch.effect);
				} else {
					batch.skip_effect(branch.effect);
				}
			}
			batch.oncommit(this.#commit);
			batch.ondiscard(this.#discard);
		} else {
			if (hydrating) {
				this.anchor = hydrate_node;
			}
			this.#commit(batch);
		}
	}
}

export { BranchManager };
