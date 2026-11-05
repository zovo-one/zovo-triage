import React from '../npm/ztg-dom-chef.js';
import { getOldFeatureNames } from '../ztg-feature-data.js';

function createRghIssueLink(issueNumber, newTab = false) {
	const issueUrl = `https://github.com/refined-github/refined-github/issues/${issueNumber}`;
	return (
		React.createElement('a', {
			'data-hovercard-type': "issue",
			'data-hovercard-url': issueUrl + '/hovercard',
			href: issueUrl,
			target: newTab ? '_blank' : undefined,
			rel: newTab ? 'noopener noreferrer' : undefined,}
, "#"
, issueNumber
)
	);
}

function getFeatureUrl(id) {
	return `https://github.com/refined-github/refined-github/blob/main/source/features/${id}.tsx`;
}

function getFeatureRelatedIssuesQuery(id) {
	const oldNames = getOldFeatureNames(id);
	const searchTerms = [id, ...oldNames].map(name => `"${name}"`);
	const joinedTerms = searchTerms.length > 1 ? `(${searchTerms.join(' OR ')})` : searchTerms[0];
	return `state:open ${joinedTerms}`;
}

function getFeatureRelatedIssuesUrl(id) {
	const conversationsUrl = new URL('https://github.com/refined-github/refined-github/issues');
	conversationsUrl.searchParams.set('q', getFeatureRelatedIssuesQuery(id));
	return conversationsUrl;
}

export { createRghIssueLink, getFeatureRelatedIssuesQuery, getFeatureRelatedIssuesUrl, getFeatureUrl };
