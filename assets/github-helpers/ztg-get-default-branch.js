import elementReady from '../npm/ztg-element-ready.js';
import '../npm/ztg-webext-storage-cache.js';
import api from './ztg-api.js';
import GetDefaultBranch from './ztg-get-default-branch.gql.js';
import { getRepo, extractCurrentBranchFromBranchPicker } from './ztg-index.js';
import { branchSelector } from './ztg-selectors.js';
import CachedFunction from '../npm/ztg-webext-storage-cache-cached-function.js';

const isCurrentRepo = (nameWithOwner) => getRepo()?.nameWithOwner === nameWithOwner;

// Do not make this function complicated. We're only optimizing for the repo root.
async function fromDom() {
	if (!['', 'commits'].includes(getRepo().path)) {
		return;
	}

	// We're on the default branch, so we can extract it from the current page. This exclusively happens on the exact pages:
	// /user/repo
	// /user/repo/commits (without further path)
	const element = await elementReady(branchSelector);

	if (!element) {
		return;
	}

	return extractCurrentBranchFromBranchPicker(element);
}

async function fromApi(repository) {
	const [owner, name] = repository.split('/', 2);
	const response = await api.v4(GetDefaultBranch, {
		variables: {
			owner,
			name,
		},
	});

	return response.repository.defaultBranchRef.name;
}

const defaultBranchOfRepo = new CachedFunction('default-branch', {
	// DO NOT use optional arguments/defaults in "cached functions" because they can't be memoized effectively
	// https://github.com/sindresorhus/eslint-plugin-unicorn/issues/1864
	async updater(repository) {
		if (!repository) {
			throw new Error('getDefaultBranch was called on a non-repository page');
		}

		// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Wrong, type can be `false`
		return (isCurrentRepo(repository) && await fromDom()) || fromApi(repository);
	},

	maxAge: {hours: 1},
	staleWhileRevalidate: {days: 20},
});

async function getDefaultBranch() {
	return defaultBranchOfRepo.get(getRepo().nameWithOwner);
}

export { getDefaultBranch as default, defaultBranchOfRepo };
