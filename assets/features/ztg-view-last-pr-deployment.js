import React from '../npm/ztg-dom-chef.js';
import { isPRConversation } from '../npm/ztg-github-url-detection.js';
import RocketIcon from '../npm/ztg-octicons-plain-react-components-Rocket.js';
import { lastElementOptional } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import observe from '../helpers/ztg-selector-observer.js';
import { withTooltipRef } from '../components/ztg-tooltip.js';

function addLink(header) {
	const lastDeployment = lastElementOptional('.js-timeline-item a[title="Deployment has completed"]');
	if (!lastDeployment) {
		return;
	}

	// Use "parentElement" because open PRs have a "PR status" button before the "Code" button
	header.parentElement.prepend(
		React.createElement('a', {
			ref: withTooltipRef('View last deployment'),
			className: "rgh-last-deployment btn d-none d-md-block"   ,
			target: "_blank", // Matches GitHub’s own behavior
			rel: "noopener noreferrer" ,
			href: lastDeployment.href,}

, React.createElement(RocketIcon, null )
),
	);
}

function init(signal) {
	observe(
		'button[class*="PullRequestCodeButton"]',
		addLink,
		{signal},
	);
}

void features.add(import.meta.url, {
	include: [
		isPRConversation,
	],
	awaitDomReady: true, // Must select last item on the page
	init,
});

/*
Test URLs:
- All inactive: https://github.com/btkostner/btkostner.io/pull/10
- Some active: https://github.com/fregante/bundle/pull/6
*/
