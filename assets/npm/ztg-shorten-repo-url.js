import reservedNames from './ztg-github-reserved-names-reserved-names.json.js';

const patchDiffRegex = /[.](patch|diff)$/;
const releaseRegex = /^releases[/]tag[/]([^/]+)/;
const labelRegex = /^labels[/]([^/]+)/;
const compareRegex = /^compare[/]([^/]+)/;
const pullRegex = /^pull[/](?<pull>\d+)(?:[/](?<pullPage>[^/]+))?(?:[/](?<pullPartialStart>[\da-f]{40})[.][.](?<pullPartialEnd>[\da-f]{40}))?$/;
const issueRegex = /^issues[/](\d+)$/;
const commitRegex = /^commit[/]([\da-f]{40})$/;
const releaseArchiveRegex = /^archive[/](.+)([.]zip|[.]tar[.]gz)/;
const releaseDownloadRegex = /^releases[/]download[/]([^/]+)[/](.+)/;
const dependentsRegex = /^network[/]dependents[/]?$/;
const dependenciesRegex = /^network[/]dependencies[/]?$/;
const wikiRegex = /^wiki[/](.+)$/;
function pullQueryOut(searchParameters, pathname) {
	let query = searchParameters.get('q');
	if (!query) {
		return '';
	}
	searchParameters.delete('q');
	if (pathname.endsWith('/issues')) {
		query = query.replace('is:issue', '');
	}
	if (pathname.endsWith('/pulls')) {
		query = query.replace('is:pr', '');
	}
	return ` (${query.replaceAll(/\s+/g, ' ').trim()})`;
}
function styleRevision(revision) {
	if (!revision) {
		return;
	}
	revision = revision.replace(patchDiffRegex, '');
	if (/^[0-9a-f]{40}$/.test(revision)) {
		revision = revision.slice(0, 7);
	}
	return `<code>${revision}</code>`;
}
function commentIndicator(hash) {
	if (hash.startsWith('#issue-') || hash.startsWith('#commitcomment-')) {
		return ' (comment)';
	}
	if (hash.startsWith('#pullrequestreview-') || hash.startsWith('#discussion_r')) {
		return ' (review)';
	}
	return '';
}
function joinValues(array, delimiter = '/') {
	return array.filter(Boolean).join(delimiter);
}
function shortenRepoUrl(href, currentUrl = 'https://github.com') {
	if (!href) {
		return;
	}
	currentUrl = new URL(currentUrl);
	const currentRepo = currentUrl.pathname.slice(1).split('/', 2).join('/');
	const origin = href.split('/', 3).join('/');
	const pathname = href.slice(origin.length).replace(/[?#].*/, '') || '/';
	const hash = /#.+$/.exec(href)?.[0] ?? '';
	const url = new URL(href);
	const {search, searchParams} = url;
	const pathnameParts = pathname.slice(1).split('/');
	const repoPath = pathnameParts.slice(2).join('/');
	const isRaw = [
		'https://raw.githubusercontent.com',
		'https://cdn.rawgit.com',
		'https://rawgit.com',
	].includes(origin);
	const isRedirection = [
		'https://togithub.com',
		'https://github-redirect.dependabot.com',
		'https://redirect.github.com',
	].includes(origin);
	let [
		user,
		repo,
		type,
		revision,
		...filePath
	] = pathnameParts;
	if (isRaw) {
		[
			user,
			repo,
			revision,
			...filePath
		] = pathnameParts;
		type = 'raw';
	}
	revision = styleRevision(revision);
	filePath = filePath.join('/');
	const isLocal = origin === currentUrl.origin;
	const isThisRepo = (isLocal || isRaw || isRedirection) && currentRepo === `${user}/${repo}`;
	const isReserved = reservedNames.includes(user);
	const isDependents = dependentsRegex.test(repoPath);
	const isDependencies = dependenciesRegex.test(repoPath);
	const [, diffOrPatch] = repoPath.match(patchDiffRegex) || [];
	const [, release] = repoPath.match(releaseRegex) || [];
	const [, releaseTag, releaseTagExtension] = repoPath.match(releaseArchiveRegex) || [];
	const [, downloadTag, downloadFilename] = repoPath.match(releaseDownloadRegex) || [];
	const [, label] = repoPath.match(labelRegex) || [];
	const [, compare] = repoPath.match(compareRegex) || [];
	const {pull, pullPage, pullPartialStart, pullPartialEnd} = repoPath.match(pullRegex)?.groups ?? {};
	const [, issue] = isRedirection ? repoPath.match(issueRegex) || [] : [];
	const [, commit] = isRedirection ? repoPath.match(commitRegex) || [] : [];
	const [, wiki] = repoPath.match(wikiRegex) || [];
	const isFileOrDirectory = revision && [
		'raw',
		'tree',
		'blob',
		'blame',
		'commits',
	].includes(type);
	const repoUrl = isThisRepo ? '' : `${user}/${repo}`;
	if (isReserved || pathname === '/' || (!isLocal && !isRaw && !isRedirection)) {
		const cleanHref = [
			origin
				.replace(/^https:[/][/]/, '')
				.replace(/^www[.]/, ''),
			pathname
				.replace(/[/]$/, ''),
		];
		if (['issues', 'pulls'].includes(user) && !repo) {
			const query = pullQueryOut(url.searchParams, url.pathname);
			cleanHref.push(url.search, query);
		} else {
			cleanHref.push(url.search);
		}
		cleanHref.push(decodeURI(url.hash));
		return cleanHref.join('');
	}
	if (user && !repo) {
		return `@${user}${search}${hash}`;
	}
	if (isFileOrDirectory) {
		const revisioned = joinValues(
			[joinValues([repoUrl, revision], '@'), filePath],
			'/',
		);
		const partial = `${revisioned}${search}${hash}`;
		if (type !== 'blob' && type !== 'tree') {
			return `${partial} (${type})`;
		}
		return partial;
	}
	if (diffOrPatch) {
		const partial = joinValues([repoUrl, revision], '@');
		return `${partial}.${diffOrPatch}${search}${hash}`;
	}
	if (release) {
		const partial = joinValues([repoUrl, `<code>${release}</code>`], '@');
		return `${partial}${search}${hash} (release)`;
	}
	if (releaseTagExtension) {
		const partial = joinValues([repoUrl, `<code>${releaseTag}</code>`], '@');
		return `${partial}${releaseTagExtension}${search}${hash}`;
	}
	if (downloadFilename) {
		const partial = joinValues([repoUrl, `<code>${downloadTag}</code>`], '@');
		return `${partial} ${downloadFilename}${search}${hash} (download)`;
	}
	if (label) {
		return (
			joinValues([repoUrl, decodeURIComponent(label)])
			+ `${search}${hash} (label)`
		);
	}
	if (isDependents) {
		return `${user}/${repo} (dependents)`;
	}
	if (isDependencies) {
		return `${user}/${repo} (dependencies)`;
	}
	if (pull) {
		if (pullPage === 'files' && pullPartialStart && pullPartialEnd) {
			return `<code>${pullPartialStart.slice(0, 8)}..${pullPartialEnd.slice(0, 8)}</code> (#${pull})`;
		}
		if (pullPage) {
			return `${repoUrl}#${pull} (${pullPage})`;
		}
	}
	if (compare) {
		const partial = joinValues([repoUrl, revision], '@');
		return `${partial}${search}${hash} (compare)`;
	}
	if (wiki) {
		const hashPart = (hash ? ' (' + hash.slice(1) + ')' : '');
		const cleanLabel = (wiki + hashPart).replaceAll('-', ' ');
		const repoPart = repoUrl ? ` (${repoUrl})` : '';
		return `Wiki: ${decodeURIComponent(cleanLabel)}${repoPart}`;
	}
	if (isRedirection) {
		if (issue) {
			return `${repoUrl}#${issue}${commentIndicator(hash)}`;
		}
		if (pull) {
			return `${repoUrl}#${pull}${commentIndicator(hash)}`;
		}
		if (commit) {
			return joinValues([repoUrl, `<code>${commit.slice(0, 7)}</code>`], '@') + commentIndicator(hash);
		}
	}
	const query = pullQueryOut(searchParams, pathname);
	if (searchParams.get('tab') === 'readme-ov-file') {
		searchParams.delete('tab');
	}
	return pathname.replaceAll(/^[/]|[/]$/g, '') + url.search + hash + query;
}
function safeDecode(url) {
	try {
		return new URL(url).href;
	} catch {
		return url;
	}
}
function getLinkHref(a) {
	return a.dataset.originalHref ?? a.href;
}
function isCustomLink(a) {
	const url = safeDecode(getLinkHref(a));
	const label = safeDecode(a.textContent);
	return (
		url !== label.trim()
		&& url !== `${label}/`
	);
}
function applyToLink(a, currentUrl) {
	if (
		!isCustomLink(a)
		&& !a.firstElementChild
	) {
		const url = a.textContent;
		const shortened = shortenRepoUrl(url, currentUrl);
		a.replaceChildren(...shortened.split(/<code>([^<]+)<\/code>/g).map((part, i) => {
			if (i % 2 === 0) {
				return part;
			}
			const codeElement = document.createElement('code');
			codeElement.textContent = part;
			return codeElement;
		}));
		return true;
	}
	return false;
}

export { applyToLink, shortenRepoUrl as default };
