import { BOUNDARY_EFFECT, EFFECT_TRANSPARENT, EFFECT_PRESERVED } from './ztg-svelte-internal-client-constants.js';
import { HYDRATION_START_ELSE, HYDRATION_START_FAILED } from './ztg-svelte-constants.js';
import { set_component_context, component_context } from './ztg-svelte-internal-client-context.js';
import { handle_error, invoke_error_boundary } from './ztg-svelte-internal-client-error-handling.js';
import { block, branch, pause_effect, move_effect, destroy_effect } from './ztg-svelte-internal-client-reactivity-effects.js';
import { active_effect, set_active_effect, set_active_reaction, active_reaction, get } from './ztg-svelte-internal-client-runtime.js';
import { hydrate_node, hydrating, hydrate_next, set_hydrate_node, next, skip_nodes } from './ztg-svelte-internal-client-dom-hydration.js';
import { queue_micro_task } from './ztg-svelte-internal-client-dom-task.js';
import { svelte_boundary_reset_onerror } from './ztg-svelte-internal-client-errors.js';
import { svelte_boundary_reset_noop } from './ztg-svelte-internal-client-warnings.js';
import { current_batch, Batch } from './ztg-svelte-internal-client-reactivity-batch.js';
import { internal_set, source } from './ztg-svelte-internal-client-reactivity-sources.js';
import { createSubscriber } from './ztg-svelte-reactivity-create-subscriber.js';
import { create_text } from './ztg-svelte-internal-client-dom-operations.js';
import { defer_effect } from './ztg-svelte-internal-client-reactivity-utils.js';

var flags = EFFECT_TRANSPARENT | EFFECT_PRESERVED;
function boundary(node, props, children, transform_error) {
	new Boundary(node, props, children, transform_error);
}
class Boundary {
	parent;
	is_pending = false;
	transform_error;
	#anchor;
	#hydrate_open = hydrating ? hydrate_node : null;
	#props;
	#children;
	#effect;
	#main_effect = null;
	#pending_effect = null;
	#failed_effect = null;
	#offscreen_fragment = null;
	#local_pending_count = 0;
	#pending_count = 0;
	#pending_count_update_queued = false;
	#dirty_effects = new Set();
	#maybe_dirty_effects = new Set();
	#effect_pending = null;
	#effect_pending_subscriber = createSubscriber(() => {
		this.#effect_pending = source(this.#local_pending_count);
		return () => {
			this.#effect_pending = null;
		};
	});
	constructor(node, props, children, transform_error) {
		this.#anchor = node;
		this.#props = props;
		this.#children = (anchor) => {
			var effect =  (active_effect);
			effect.b = this;
			effect.f |= BOUNDARY_EFFECT;
			children(anchor);
		};
		this.parent =  (active_effect).b;
		this.transform_error = transform_error ?? this.parent?.transform_error ?? ((e) => e);
		this.#effect = block(() => {
			if (hydrating) {
				const comment =  (this.#hydrate_open);
				hydrate_next();
				const server_rendered_pending = comment.data === HYDRATION_START_ELSE;
				const server_rendered_failed = comment.data.startsWith(HYDRATION_START_FAILED);
				if (server_rendered_failed) {
					const serialized_error = JSON.parse(comment.data.slice(HYDRATION_START_FAILED.length));
					this.#hydrate_failed_content(serialized_error);
				} else if (server_rendered_pending) {
					this.#hydrate_pending_content();
				} else {
					this.#hydrate_resolved_content();
				}
			} else {
				this.#render();
			}
		}, flags);
		if (hydrating) {
			this.#anchor = hydrate_node;
		}
	}
	#hydrate_resolved_content() {
		try {
			this.#main_effect = branch(() => this.#children(this.#anchor));
		} catch (error) {
			this.error(error);
		}
	}
	#hydrate_failed_content(error) {
		const failed = this.#props.failed;
		const { reset, invoke_onerror } = this.#create_reset(error);
		queue_micro_task(invoke_onerror);
		if (!failed) return;
		this.#failed_effect = branch(() => {
			failed(
				this.#anchor,
				() => error,
				() => reset
			);
		});
	}
	#create_reset(error) {
		var did_reset = false;
		var calling_on_error = false;
		const reset = () => {
			if (did_reset) {
				svelte_boundary_reset_noop();
				return;
			}
			did_reset = true;
			if (calling_on_error) {
				svelte_boundary_reset_onerror();
			}
			if (this.#failed_effect !== null) {
				pause_effect(this.#failed_effect, () => {
					this.#failed_effect = null;
				});
			}
			this.#run(() => {
				this.#render();
			});
		};
		const invoke_onerror = () => {
			try {
				calling_on_error = true;
				this.#props.onerror?.(error, reset);
				calling_on_error = false;
			} catch (err) {
				invoke_error_boundary(err, this.#effect && this.#effect.parent);
			}
		};
		return { reset, invoke_onerror };
	}
	#hydrate_pending_content() {
		const pending = this.#props.pending;
		if (!pending) return;
		this.is_pending = true;
		this.#pending_effect = branch(() => pending(this.#anchor));
		queue_micro_task(() => {
			var fragment = (this.#offscreen_fragment = document.createDocumentFragment());
			var anchor = create_text();
			fragment.append(anchor);
			this.#main_effect = this.#run(() => {
				return branch(() => this.#children(anchor));
			});
			if (this.#pending_count === 0) {
				this.#anchor.before(fragment);
				this.#offscreen_fragment = null;
				pause_effect( (this.#pending_effect), () => {
					this.#pending_effect = null;
				});
				this.#resolve( (current_batch));
			}
		});
	}
	#render() {
		try {
			this.is_pending = this.has_pending_snippet();
			this.#pending_count = 0;
			this.#local_pending_count = 0;
			this.#main_effect = branch(() => {
				this.#children(this.#anchor);
			});
			if (this.#pending_count > 0) {
				var fragment = (this.#offscreen_fragment = document.createDocumentFragment());
				move_effect(this.#main_effect, fragment);
				const pending =  (this.#props.pending);
				this.#pending_effect = branch(() => pending(this.#anchor));
			} else {
				this.#resolve( (current_batch));
			}
		} catch (error) {
			this.error(error);
		}
	}
	#resolve(batch) {
		this.is_pending = false;
		batch.transfer_effects(this.#dirty_effects, this.#maybe_dirty_effects);
	}
	defer_effect(effect) {
		defer_effect(effect, this.#dirty_effects, this.#maybe_dirty_effects);
	}
	is_rendered() {
		return !this.is_pending && (!this.parent || this.parent.is_rendered());
	}
	has_pending_snippet() {
		return !!this.#props.pending;
	}
	#run(fn) {
		var previous_effect = active_effect;
		var previous_reaction = active_reaction;
		var previous_ctx = component_context;
		set_active_effect(this.#effect);
		set_active_reaction(this.#effect);
		set_component_context(this.#effect.ctx);
		try {
			Batch.ensure();
			return fn();
		} catch (e) {
			handle_error(e);
			return null;
		} finally {
			set_active_effect(previous_effect);
			set_active_reaction(previous_reaction);
			set_component_context(previous_ctx);
		}
	}
	#update_pending_count(d, batch) {
		if (!this.has_pending_snippet()) {
			if (this.parent) {
				this.parent.#update_pending_count(d, batch);
			}
			return;
		}
		this.#pending_count += d;
		if (this.#pending_count === 0) {
			this.#resolve(batch);
			if (this.#pending_effect) {
				pause_effect(this.#pending_effect, () => {
					this.#pending_effect = null;
				});
			}
			if (this.#offscreen_fragment) {
				this.#anchor.before(this.#offscreen_fragment);
				this.#offscreen_fragment = null;
			}
		}
	}
	update_pending_count(d, batch) {
		this.#update_pending_count(d, batch);
		this.#local_pending_count += d;
		if (!this.#effect_pending || this.#pending_count_update_queued) return;
		this.#pending_count_update_queued = true;
		queue_micro_task(() => {
			this.#pending_count_update_queued = false;
			if (this.#effect_pending) {
				internal_set(this.#effect_pending, this.#local_pending_count);
			}
		});
	}
	get_effect_pending() {
		this.#effect_pending_subscriber();
		return get( (this.#effect_pending));
	}
	error(error) {
		if (!this.#props.onerror && !this.#props.failed) {
			throw error;
		}
		if (current_batch?.is_fork) {
			if (this.#main_effect) current_batch.skip_effect(this.#main_effect);
			if (this.#pending_effect) current_batch.skip_effect(this.#pending_effect);
			if (this.#failed_effect) current_batch.skip_effect(this.#failed_effect);
			current_batch.oncommit(() => {
				this.#handle_error(error);
			});
		} else {
			this.#handle_error(error);
		}
	}
	#handle_error(error) {
		if (this.#main_effect) {
			destroy_effect(this.#main_effect);
			this.#main_effect = null;
		}
		if (this.#pending_effect) {
			destroy_effect(this.#pending_effect);
			this.#pending_effect = null;
		}
		if (this.#failed_effect) {
			destroy_effect(this.#failed_effect);
			this.#failed_effect = null;
		}
		if (hydrating) {
			set_hydrate_node( (this.#hydrate_open));
			next();
			set_hydrate_node(skip_nodes());
		}
		let failed = this.#props.failed;
		const handle_error_result = (transformed_error) => {
			const { reset, invoke_onerror } = this.#create_reset(transformed_error);
			invoke_onerror();
			if (failed) {
				this.#failed_effect = this.#run(() => {
					try {
						return branch(() => {
							var effect =  (active_effect);
							effect.b = this;
							effect.f |= BOUNDARY_EFFECT;
							failed(
								this.#anchor,
								() => transformed_error,
								() => reset
							);
						});
					} catch (error) {
						invoke_error_boundary(error,  (this.#effect.parent));
						return null;
					}
				});
			}
		};
		queue_micro_task(() => {
			var result;
			try {
				result = this.transform_error(error);
			} catch (e) {
				invoke_error_boundary(e, this.#effect && this.#effect.parent);
				return;
			}
			if (
				result !== null &&
				typeof result === 'object' &&
				typeof ( (result).then) === 'function'
			) {
				 (result).then(
					handle_error_result,
					(e) => invoke_error_boundary(e, this.#effect && this.#effect.parent)
				);
			} else {
				handle_error_result(result);
			}
		});
	}
}

export { Boundary, boundary };
