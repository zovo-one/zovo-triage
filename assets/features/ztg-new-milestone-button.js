import React from '../npm/ztg-dom-chef.js';
import { isMilestone } from '../npm/ztg-github-url-detection.js';
import features from '../ztg-feature-manager.js';
import { buildRepoUrl } from '../github-helpers/ztg-index.js';
import observe from '../helpers/ztg-selector-observer.js';

function addButton(editButton) {
	editButton.before(
		React.createElement('a', {
			href: buildRepoUrl('milestones/new'),
			className: "btn",}
, "New Milestone"

),
	);
}

function init(signal) {
	const repoBase = buildRepoUrl('milestones');

	observe(`a[href*="${repoBase}/"][href$="/edit"]`, addButton, {signal});
}

void features.add(import.meta.url, {
	include: [
		isMilestone,
	],
	init,
});

/*
Test URLs:

https://github.com/go-gitea/gitea/milestone/186
*/
