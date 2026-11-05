import delegate from '../npm/ztg-delegate-it-delegate.js';
import React from '../npm/ztg-dom-chef.js';
import { isIssue } from '../npm/ztg-github-url-detection.js';
import { $$, $optional, elementExists, closestElement, $, closestElementOptional, countElements } from '../npm/ztg-select-dom.js';
import features from '../ztg-feature-manager.js';
import delay from '../helpers/ztg-delay.js';
import isLowQualityComment from '../helpers/ztg-is-low-quality-comment.js';

const singleParagraphCommentSelector = '.comment-body > p:only-child';

async function unhide(event) {
	for (const comment of $$('.rgh-hidden-comment')) {
		comment.hidden = false;
	}

	await delay(10); // "Similar comments" aren't expanded without this in Safari #3830

	// Expand all "similar comments" boxes
	for (const similarCommentsExpandButton of $$('.rgh-hidden-comment > summary')) {
		similarCommentsExpandButton.click();
	}

	$('.rgh-hidden-comment').scrollIntoView();
	event.delegateTarget.parentElement.remove();
}

function hideComment(comment) {
	comment.hidden = true;
	comment.classList.add('rgh-hidden-comment');
}

function init() {
	for (const similarCommentsBox of $$('.js-discussion .Details-element:not([data-body-version])')) {
		hideComment(similarCommentsBox);
	}

	const linkedComment = location.hash.startsWith('#issuecomment-')
		? $optional(`${location.hash} ${singleParagraphCommentSelector}`)
		: undefined;

	for (const commentText of $$(singleParagraphCommentSelector)) {
		// Exclude explicitly linked comments #5363
		if (commentText === linkedComment) {
			continue;
		}

		if (!isLowQualityComment(commentText.textContent)) {
			continue;
		}

		// Comments that contain useful images or links shouldn't be removed
		// Images are wrapped in <a> tags on GitHub hence included in the selector
		if (elementExists('a', commentText)) {
			continue;
		}

		// Ensure that they're not by VIPs (owner, collaborators, etc)
		const comment = closestElement('.js-timeline-item', commentText);
		if (elementExists('.Label', comment)) {
			continue;
		}

		// If the person is having a conversation, then don't hide it
		const author = $('.author', comment).getAttribute('href');
		// If the first comment left by the author isn't a low quality comment
		// (previously hidden or about to be hidden), then leave this one as well
		const previousComment = $(`.js-timeline-item:not([hidden]) .unminimized-comment .author[href="${author}"]`);
		if (closestElementOptional('.js-timeline-item', previousComment) !== comment) {
			continue;
		}

		hideComment(comment);
	}

	const lowQualityCount = countElements('.rgh-hidden-comment');
	if (lowQualityCount > 0) {
		$('.discussion-timeline-actions').prepend(
			React.createElement('p', { className: "rgh-low-quality-comments-note",}
, `${lowQualityCount} unhelpful comment${lowQualityCount > 1 ? 's were' : ' was'} automatically hidden. `
, React.createElement('button', { className: "btn-link text-emphasized rgh-unhide-low-quality-comments"  , type: "button",}, "Show")
),
		);

		// No need to add the signal here
		delegate('.rgh-unhide-low-quality-comments', 'click', unhide);
	}
}

// This should NOT be made dynamic via observer, it's not worth updating the lowQuality count for fresh comments
void features.add(import.meta.url, {
	include: [
		isIssue,
	],
	deduplicate: '.rgh-low-quality-comments-note',
	awaitDomReady: true,
	init,
});

/*

## Test URLs

- 26 hidden comments: https://togithub.com/stephencookdev/speed-measure-webpack-plugin/issues/167#issue-849740710
- Linked comment should not be collapsed: https://togithub.com/stephencookdev/speed-measure-webpack-plugin/issues/167#issuecomment-821212185

*/

export { singleParagraphCommentSelector };
