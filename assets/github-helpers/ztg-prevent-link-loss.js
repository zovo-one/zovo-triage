import { replaceFieldText } from '../npm/ztg-text-field-edit.js';
import { getConversationNumber, getRepo } from './ztg-index.js';

function getRepoReference(currentRepo, repoNameWithOwner, delimiter = '') {
	return repoNameWithOwner === currentRepo.nameWithOwner ? '' : repoNameWithOwner + delimiter;
}

// TODO: Drop after we drop Safari <18.2 support https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/escape
const escapeRegex = (string) => string.replaceAll(/[$()*+.?[\\\]^{|}]/g, String.raw`\$&`);
const prCommitPathnameRegex =
	/[/]([^/]+[/][^/]+)[/]pull[/](\d+)[/](?:commits|changes)[/]([\da-f]{7})[\da-f]{33}(?:[.]{2}([\da-f]{7})[\da-f]{33})?(?:#[\w-]+)?\b/;
const prCommitUrlRegex = new RegExp(
	String.raw`\b` + escapeRegex(location.origin) + prCommitPathnameRegex.source,
	'gi',
);

const prComparePathnameRegex = /[/]([^/]+[/][^/]+)[/]compare[/](.+)(#diff-[\d\-LRa-f]+)/;
const prCompareUrlRegex = new RegExp(
	String.raw`\b` + escapeRegex(location.origin) + prComparePathnameRegex.source,
	'gi',
);

const discussionPathnameRegex = /[/]([^/]+[/][^/]+)[/]discussions[/](\d+)[?][^\s#]+(#[\w-]+)?\b/;
const discussionUrlRegex = new RegExp(
	String.raw`\b` + escapeRegex(location.origin) + discussionPathnameRegex.source,
	'gi',
);

// To be used as replacer callback in string.replace() for PR commit links
function preventPrCommitLinkLoss(
	url,
	repoNameWithOwner,
	pr,
	commit,
	commit2,
	index,
	fullText,
) {
	if (fullText[index + url.length] === ')') {
		return url;
	}

	const currentPr = getConversationNumber();
	const prReference = currentPr && Number(pr) === currentPr ? '(this PR)' : `(#${pr})`;
	const commitReference = commit2 ? `${commit}..${commit2}` : commit;
	return `[${getRepoReference(getRepo(), repoNameWithOwner, '@')}\`${commitReference}\` ${prReference}](${url})`;
}

// To be used as replacer callback in string.replace() for compare links
function preventPrCompareLinkLoss(
	url,
	repoNameWithOwner,
	compare,
	hash,
	index,
	fullText,
) {
	if (fullText[index + url.length] === ')') {
		return url;
	}

	return `[${getRepoReference(getRepo(), repoNameWithOwner, '@')}\`${compare}\`${hash.slice(0, 16)}](${url})`;
}

// To be used as replacer callback in string.replace() for discussion links
function preventDiscussionLinkLoss(
	url,
	repoNameWithOwner,
	discussion,
	comment,
	index,
	fullText,
) {
	if (fullText[index + url.length] === ')') {
		return url;
	}

	return `[${getRepoReference(getRepo(), repoNameWithOwner)}#${discussion}${comment ? ' (comment)' : ''}](${url})`;
}

function isVulnerableToLinkLoss(value) {
	// The replacement logic is not just in the regex, so it alone can't be used to detect the need for the replacement
	return value !== value.replace(prCommitUrlRegex, preventPrCommitLinkLoss)
		|| value !== value.replace(prCompareUrlRegex, preventPrCompareLinkLoss)
		|| value !== value.replace(discussionUrlRegex, preventDiscussionLinkLoss);
}

function avoidLinkLoss(field) {
	replaceFieldText(field, prCommitUrlRegex, preventPrCommitLinkLoss);
	replaceFieldText(field, prCompareUrlRegex, preventPrCompareLinkLoss);
	replaceFieldText(field, discussionUrlRegex, preventDiscussionLinkLoss);
}

export { avoidLinkLoss, discussionUrlRegex, isVulnerableToLinkLoss, prCommitUrlRegex, prCompareUrlRegex, preventDiscussionLinkLoss, preventPrCommitLinkLoss, preventPrCompareLinkLoss };
