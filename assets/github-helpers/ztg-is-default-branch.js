import getDefaultBranch from './ztg-get-default-branch.js';
import { getRepo } from './ztg-index.js';

/** Detects if the current view is on the default branch. To be used on file/folder/commit lists */
async function isDefaultBranch() {
	const repo = getRepo();
	if (!repo) {
		// Like /settings/repositories
		return false;
	}

	const [type, ...parts] = repo.path.split('/');
	if (parts.length === 0) {
		// Exactly /user/repo, which is on the default branch
		return true;
	}

	if (!['tree', 'blob', 'commits'].includes(type)) {
		// Like /user/repo/pulls
		return false;
	}

	// Don't use `getCurrentGitRef` because it requires too much DOM. This is good enough, it only fails when:
	// defaultBranch === 'a/b' && currentBranch === 'a'
	const path = parts.join('/');
	const defaultBranch = await getDefaultBranch();
	return path === defaultBranch || path.startsWith(`${defaultBranch}/`);
}

export { isDefaultBranch as default };
