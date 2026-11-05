import React from '../npm/ztg-dom-chef.js';
import doma from '../npm/ztg-doma.js';
import { hasComments, isGistFile } from '../npm/ztg-github-url-detection.js';
import memoize from '../npm/ztg-memoize.js';
import { messageRuntime } from '../npm/ztg-webext-msg.js';
import features from '../ztg-feature-manager.js';
import { standaloneGistLinkInMarkdown } from '../github-helpers/ztg-selectors.js';
import observe from '../helpers/ztg-selector-observer.js';

// Fetch via background.js due to CORB policies. Also memoize to avoid multiple requests.
const fetchGist = memoize(
	async (url) => messageRuntime({fetchJson: `${url}.json`}),
);

const isOnlyChild = (link) =>
	link.textContent.trim() === link.parentElement.textContent.trim();

async function embedGist(link) {
	const info = React.createElement('em', null, " (loading)" );
	link.after(info);

	try {
		const gistData = await fetchGist(link.href);
		if (gistData.div.length > 10_000) {
			info.textContent = ' (too large to embed)';
			return;
		}

		const fileCount = gistData.files.length;
		if (fileCount > 1) {
			info.textContent = ` (${fileCount} files)`;
		} else {
			const container = React.createElement('div', null );
			container.attachShadow({mode: 'open'}).append(
				React.createElement('style', null, `
					.gist .gist-data {
						max-height: 16em;
						overflow-y: auto;
					}
				`
),
				React.createElement('link', { rel: "stylesheet", href: gistData.stylesheet,} ),
				doma.one(gistData.div),
			);
			link.parentElement.after(container);
			info.remove();
		}
	} catch (error) {
		info.remove();
		throw error;
	}
}

function init(signal) {
	observe(standaloneGistLinkInMarkdown, link => {
		if (isGistFile(link) && isOnlyChild(link)) {
			void embedGist(link);
		}
	}, {signal});
}

void features.add(import.meta.url, {
	include: [
		hasComments,
	],
	init,
});

/*

Test URLs

https://github.com/refined-github/sandbox/issues/77

*/
