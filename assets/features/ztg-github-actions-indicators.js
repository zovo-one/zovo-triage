import { parseCron } from '../npm/ztg-@fregante-mi-cron.js';
import React from '../npm/ztg-dom-chef.js';
import { isRepositoryActions } from '../npm/ztg-github-url-detection.js';
import PlayIcon from '../npm/ztg-octicons-plain-react-components-Play.js';
import { $, $optional } from '../npm/ztg-select-dom.js';
import '../npm/ztg-webext-storage-cache.js';
import features from '../ztg-feature-manager.js';
import api from '../github-helpers/ztg-api.js';
import { cacheByRepo } from '../github-helpers/ztg-index.js';
import removeHashFromUrlBar from '../helpers/ztg-history.js';
import observe from '../helpers/ztg-selector-observer.js';
import { withTooltipRef } from '../components/ztg-tooltip.js';
import GetWorkflows from './ztg-github-actions-indicators.gql.js';
import CachedFunction from '../npm/ztg-webext-storage-cache-cached-function.js';

// There is no way to get a workflow list in the v4 API #6543
async function getWorkflows() {
	const response = await api.v3('actions/workflows');

	const workflows = response.workflows ;

	// The response is not reliable: Some workflow's path is '' and deleted workflow's state is 'active'
	return workflows
		.map(workflow => ({
			name: workflow.path.split('/').pop(),
			isEnabled: workflow.state === 'active',
		}));
}

async function getFilesInWorkflowPath() {
	const {repository} = await api.v4(GetWorkflows);

	// `workflowFiles` is null on empty repos like https://github.com/fregante/empty
	const workflows = repository.workflowFiles?.entries ?? [];

	const result = {};
	for (const workflow of workflows) {
		result[workflow.name] = workflow.object.text;
	}

	return result;
}

const workflowDetails = new CachedFunction('workflows-details', {
	async updater() {
		const [workflows, workflowFiles] = await Promise.all([getWorkflows(), getFilesInWorkflowPath()]);

		const details = {};

		for (const workflow of workflows) {
			const workflowYaml = workflowFiles[workflow.name];

			if (workflowYaml === undefined) {
				// Cannot find workflow YAML; workflow removed.
				continue;
			}

			const crons = [...workflowYaml.matchAll(/^(?: {4}|\t\t)-\s*cron[\s"':]+(?<cron>[^\n"']+)/gm)].map(match =>
				match.groups.cron,
			);
			details[workflow.name] = {
				...workflow,
				schedules: crons,
				manuallyDispatchable: workflowYaml.includes('workflow_dispatch:'),
			};
		}

		return details;
	},
	maxAge: {days: 1},
	staleWhileRevalidate: {days: 10},
	cacheKey: cacheByRepo,
});

async function addIndicators(workflowLink) {
	// Called in `init`, memoized
	const workflows = await workflowDetails.get();
	const workflowName = workflowLink.href.split('/').pop();
	const workflow = workflows[workflowName];
	if (!workflow) {
		return;
	}

	if (workflow.manuallyDispatchable && workflowLink.pathname !== location.pathname) {
		if (workflowLink.nextElementSibling) {
			// User can trigger the workflow
			const url = new URL(workflowLink.href);
			url.hash = 'rgh-run-workflow';
			workflowLink.after(
				React.createElement('a', {
					ref: withTooltipRef({label: 'Trigger manually', direction: 'sw'}),
					href: url.href,
					'data-turbo-frame': workflowLink.dataset.turboFrame,
					// `actions-unpin-button` provides the hover style
					className: "Button Button--iconOnly Button--invisible Button--medium color-bg-transparent actions-unpin-button"     ,}

, React.createElement(PlayIcon, null )
),
			);
		} else {
			// User cannot trigger the workflow
			const indicator = (
				React.createElement('div', {
					ref: withTooltipRef({label: 'This workflow can be triggered manually', direction: 'sw'}),
					className: "ActionListItem-visual ActionListItem-visual--trailing" ,
					style: {pointerEvents: 'initial'},}

, React.createElement(PlayIcon, null )
)
			);
			const pinIcon = $optional('.ActionListItem-visual--trailing', workflowLink);
			if (pinIcon) {
				// Enable tooltip
				pinIcon.style.pointerEvents = 'auto';
				// Add spacing between the icons
				pinIcon.classList.add('gap-2');
				pinIcon.prepend(indicator);
			} else {
				workflowLink.append(indicator);
			}
		}
	}

	let nextTime;
	for (const schedule of workflow.schedules) {
		const time = parseCron.nextDate(schedule);
		if (time && (!nextTime || time < nextTime)) {
			nextTime = time;
		}
	}

	if (!nextTime) {
		return;
	}

	$('.ActionListItem-label', workflowLink).append(
		React.createElement('em', null, "("
, React.createElement('relative-time', { datetime: String(nextTime),} ), ")"
),
	);
}

async function init(signal) {
	observe('a.ActionListContent', addIndicators, {signal});
}

function openRunWorkflow() {
	removeHashFromUrlBar();
	// Note that the attribute is removed after the first opening, so the selector only matches it once
	const dropdown = $('details[data-deferred-details-content-url*="/actions/manual?workflow="]');
	dropdown.open = true;
}

void features.add(import.meta.url, {
	asLongAs: [
		isRepositoryActions,
		async () => Boolean(await workflowDetails.get()),
	],
	requiresToken: true,
	init,
}, {
	include: [
		() => location.hash === '#rgh-run-workflow',
	],
	awaitDomReady: true,
	init: openRunWorkflow,
});

/*

## Test URLs

Manual + scheduled:
https://github.com/sindresorhus/type-fest/actions/workflows/ts-canary.yml

Manual + disabled + pinned:
https://github.com/refined-github/sandbox/actions

*/
