import { run_all } from './ztg-svelte-internal-shared-utils.js';
import { is_flushing_sync } from './ztg-svelte-internal-client-reactivity-batch.js';

let micro_tasks = [];
function run_micro_tasks() {
	var tasks = micro_tasks;
	micro_tasks = [];
	run_all(tasks);
}
function queue_micro_task(fn) {
	if (micro_tasks.length === 0 && !is_flushing_sync) {
		var tasks = micro_tasks;
		queueMicrotask(() => {
			if (tasks === micro_tasks) run_micro_tasks();
		});
	}
	micro_tasks.push(fn);
}
function flush_tasks() {
	while (micro_tasks.length > 0) {
		run_micro_tasks();
	}
}

export { flush_tasks, queue_micro_task };
