/**
Removes the PR number from the commit title if it exists.
@example 'Something done (#123)' => 'Something done'
*/
function cleanPrCommitTitle(commitTitle, pr) {
	return commitTitle.replace(new RegExp(String.raw`\(#${pr}\)\s*$`), '').trim();
}

export { cleanPrCommitTitle as default };
