import delegate from '../npm/ztg-delegate-it-delegate.js';
import React from '../npm/ztg-dom-chef.js';
import { isBlame } from '../npm/ztg-github-url-detection.js';
import memoize from '../npm/ztg-memoize.js';
import VersionsIcon from '../npm/ztg-octicons-plain-react-components-Versions.js';
import { closestElement, $$, $, $optional } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import api from '../github-helpers/ztg-api.js';
import GitHubFileUrl from '../github-helpers/ztg-github-file-url.js';
import { multilineAriaLabel } from '../github-helpers/ztg-index.js';
import showToast from '../github-helpers/ztg-toast.js';
import looseParseInt from '../helpers/ztg-loose-parse-int.js';
import observe from '../helpers/ztg-selector-observer.js';
import GetPullRequestBlameCommit from './ztg-deep-reblame.gql.js';

const getPullRequestBlameCommit = memoize(
	async (commit, prNumbers, currentFilename) => {
		const {repository} = await api.v4(GetPullRequestBlameCommit, {
			variables: {
				commit,
				file: commit + ':' + currentFilename,
			},
		});

		const associatedPr = repository.object.associatedPullRequests.nodes[0];

		if (!associatedPr || !prNumbers.includes(associatedPr.number) || associatedPr.mergeCommit.oid !== commit) {
			throw new Error('The PR linked in the title didn’t create this commit');
		}

		if (!repository.file) {
			throw new Error('The file was renamed and Refined GitHub can’t find it');
		}

		return associatedPr.commits.nodes[0].commit.oid;
	},
);

function extractCommitFromHoverCardUrl(url) {
	return /[/]commit[/](?<commit>[0-9a-f]{40})[/]/i.exec(url).groups.commit;
}

async function redirectToBlameCommit(
	event,
) {
	const blameElement = event.delegateTarget;
	if (blameElement instanceof HTMLAnchorElement && !event.altKey) {
		return; // Unmodified click on regular link: let it proceed
	}

	event.preventDefault();
	blameElement.blur(); // Hide tooltip after click, it’s shown on :focus

	const blameHunk = closestElement('.react-blame-segment-wrapper', blameElement);
	const prNumbers = $$('.issue-link', blameHunk).map(pr => looseParseInt(pr));
	const commitInfo = $('span[data-hovercard-url*="/commit/"]', blameHunk).dataset.hovercardUrl;
	const prCommit = extractCommitFromHoverCardUrl(commitInfo);
	const blameUrl = new GitHubFileUrl(location.href);

	await showToast(async () => {
		blameUrl.branch = await getPullRequestBlameCommit(prCommit, prNumbers, blameUrl.filePath);
		blameUrl.hash = 'L' + $('.react-line-number', blameHunk).textContent;
		location.assign(blameUrl.href);
	}, {
		message: 'Fetching pull request',
		doneMessage: 'Redirecting',
	});
}

function addButton(hunk) {
	const reblameLink = $optional('a[aria-labelledby^="reblame-"]', hunk);
	if (reblameLink) {
		reblameLink.setAttribute(
			'aria-label',
			'View blame prior to this change. Hold `Alt` to extract commits from this PR first',
		);
		reblameLink.classList.add('rgh-deep-reblame');
	} else {
		$('.timestamp-wrapper-mobile', hunk).after(
			React.createElement('button', {
				type: "button",
				'aria-label': multilineAriaLabel(
					'View blame prior to this change',
					'(extracts commits from this PR first)',
				),
				className: "rgh-deep-reblame Button Button--iconOnly Button--invisible Button--small d-flex"     ,}

, React.createElement(VersionsIcon, null )
),
		);
	}
}

async function init(signal) {
	delegate('.rgh-deep-reblame', 'click', redirectToBlameCommit, {signal});
	observe('.react-blame-for-range:has([data-hovercard-type="pull_request"])', addButton, {signal});
}

void features.add(import.meta.url, {
	include: [
		isBlame,
	],
	requiresToken: true,
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github/blame/af0dd20dde497ac9dcec9cda47bee80902121298/source/features/deep-reblame.tsx

*/
