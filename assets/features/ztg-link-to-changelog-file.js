import React from '../npm/ztg-dom-chef.js';
import elementReady from '../npm/ztg-element-ready.js';
import { isSingleReleaseOrTag, isReleasesOrTags } from '../npm/ztg-github-url-detection.js';
import '../npm/ztg-webext-storage-cache.js';
import features from '../ztg-feature-manager.js';
import api from '../github-helpers/ztg-api.js';
import { getRepo, buildRepoUrl } from '../github-helpers/ztg-index.js';
import { withTooltipRef } from '../components/ztg-tooltip.js';
import GetFilesOnRoot from './ztg-link-to-changelog-file.gql.js';
import CachedFunction from '../npm/ztg-webext-storage-cache-cached-function.js';

const changelogFiles =
	/^(?:changelog|news|changes|history|release|whatsnew)(?:\.(?:mdx?|mkdn?|mdwn|mdown|markdown|litcoffee|txt|rst))?$/i;
function findChangelogName(files) {
	return files.find(name => changelogFiles.test(name)) ?? false;
}

const changelogName = new CachedFunction('changelog', {
	async updater(nameWithOwner) {
		const [owner, name] = nameWithOwner.split('/', 2);
		const {repository} = await api.v4(GetFilesOnRoot, {
			variables: {name, owner},
		});

		const files = [];
		for (const entry of repository.object.entries ) {
			if (entry.type === 'blob') {
				files.push(entry.name);
			}
		}

		return findChangelogName(files);
	},
});

async function init() {
	const changelog = await changelogName.get(getRepo().nameWithOwner);
	if (!changelog) {
		return false;
	}

	const releasesOrTagsNavbarSelector = [
		'nav[aria-label^="Releases and Tags"]', // Release list
		'.subnav-links', // Tag list
	];

	const navbar = await elementReady(releasesOrTagsNavbarSelector);
	navbar.append(
		React.createElement('a', {
			ref: withTooltipRef({label: `View the ${changelog} file`, direction: 'n'}),
			className: "subnav-item",
			href: buildRepoUrl('blob', 'HEAD', changelog),}

, React.createElement('span', null, "Changelog")
),
	);
}

void features.add(import.meta.url, {
	include: [
		isReleasesOrTags,
	],
	exclude: [
		isSingleReleaseOrTag,
	],
	deduplicate: 'has-rgh-inner',
	init,
});

/*

Test URLs:

- CHANGELOG.md: https://github.com/nodeca/js-yaml/releases/tag/4.0.0)
- CHANGELOG.rst: https://github.com/pyca/cryptography/releases)
- CHANGES: https://github.com/sphinx-doc/sphinx/releases)
- news: https://github.com/pypa/pip/releases)
- HISTORY.md: https://github.com/psf/requests/releases)

*/
