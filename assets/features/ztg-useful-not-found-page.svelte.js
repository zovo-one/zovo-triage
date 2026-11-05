import '../npm/ztg-svelte-internal-disclose-version.js';
import '../npm/ztg-svelte-internal-flags-legacy.js';
import { get } from '../npm/ztg-svelte-internal-client-runtime.js';
import { push, pop } from '../npm/ztg-svelte-internal-client-context.js';
import '../npm/ztg-svelte-internal-client-constants.js';
import { first_child, child, sibling } from '../npm/ztg-svelte-internal-client-dom-operations.js';
import { template_effect } from '../npm/ztg-svelte-internal-client-reactivity-effects.js';
import { reset, next } from '../npm/ztg-svelte-internal-client-dom-hydration.js';
import { set_text } from '../npm/ztg-svelte-internal-client-render.js';
import '../npm/ztg-svelte-internal-client-dom-reconciler.js';
import { from_html, comment, append, text } from '../npm/ztg-svelte-internal-client-dom-template.js';
import { await_block } from '../npm/ztg-svelte-internal-client-dom-blocks-await.js';
import { if_block } from '../npm/ztg-svelte-internal-client-dom-blocks-if.js';
import { set_custom_element_data, set_attribute } from '../npm/ztg-svelte-internal-client-dom-elements-attributes.js';
import { init } from '../npm/ztg-svelte-internal-client-dom-legacy-lifecycle.js';
import { create_custom_element } from '../npm/ztg-svelte-internal-client-dom-elements-custom-element.js';
import api from '../github-helpers/ztg-api.js';
import getDefaultBranch from '../github-helpers/ztg-get-default-branch.js';
import GitHubFileUrl from '../github-helpers/ztg-github-file-url.js';
import { isUrlReachable } from '../github-helpers/ztg-index.js';
import GetLatestCommitToFile from './ztg-useful-not-found-page.gql.js';

var root = from_html(`to <a> </a>`, 1);
var root_1 = from_html(`<span class="commit-ref"><a> </a></span> <a> </a> <!> <relative-time></relative-time>.`, 3);
var root_2 = from_html(`<a> </a> exists on the default branch.`, 1);
var root_3 = from_html(`<div class="color-fg-muted rgh-hide-if-empty"><!></div> <div class="color-fg-muted rgh-hide-if-empty"><!></div>`, 1);

function Useful_not_found_page($$anchor, $$props) {
	push($$props, false);

	function getType() {
		return location.pathname.split('/').pop().includes('.') ? 'file' : 'object';
	}

	async function getLatestCommitToFile(branch, filePath) {
		const { repository } = await api.v4(GetLatestCommitToFile, { variables: { branch, filePath } });

		return repository.object?.// Missing if the ref doesn't exist
		history.nodes[0]?.// Missing if the ref exists but the file never existed
		oid;
	}

	async function getChangesToFileInCommit(sha, filePath) {
		const commit = await api.v3(`commits/${sha}`);

		for (const fileInfo of commit.files) {
			if ([fileInfo.filename, fileInfo.previous_filename].includes(filePath)) {
				return {
					commit: {
						parentSha: commit.parents[0].sha,
						date: commit.commit.committer.date,
						url: commit.html_url
					},
					file: fileInfo
				};
			}
		}

		return undefined;
	}

	async function getUrlToFileOnDefaultBranch() {
		const parsedUrl = new GitHubFileUrl(location.href);

		if (!parsedUrl.branch) {
			return undefined;
		}

		parsedUrl.assign({ branch: await getDefaultBranch() });

		const urlOnDefault = parsedUrl.href;

		if (urlOnDefault !== location.href && await isUrlReachable(urlOnDefault)) {
			return urlOnDefault;
		}

		return undefined;
	}

	async function getGitHistory() {
		const url = new GitHubFileUrl(location.href);

		if (!url.branch || !url.filePath) {
			return undefined;
		}

		const commitSha = await getLatestCommitToFile(url.branch, url.filePath);

		if (!commitSha) {
			// Never existed
			return undefined;
		}

		const fileChanges = await getChangesToFileInCommit(commitSha, url.filePath);

		if (!fileChanges) {
			return undefined;
		}

		return {
			oldFilename: fileChanges.file.previous_filename ?? fileChanges.file.filename,
			lastVersionUrl: fileChanges.file.status === 'removed' ? fileChanges.file.blob_url : url.href,
			status: fileChanges.file.status,
			movedUrl: decodeURIComponent(fileChanges.file.blob_url), // Why is the API returning dir%2Ffile.js??!
			commitUrl: fileChanges.commit.url,
			commitDate: fileChanges.commit.date
		};
	}

	const type = getType();

	init();

	var fragment = root_3();
	var div = first_child(fragment);
	var node = child(div);

	await_block(
		node,
		getGitHistory,
		($$anchor) => {
			var text_4 = text();

			template_effect(() => set_text(text_4, `Loading history of this ${type ?? ''}...`));
			append($$anchor, text_4);
		},
		($$anchor, gitHistory) => {
			var fragment_1 = comment();
			var node_1 = first_child(fragment_1);

			{
				var consequent_1 = ($$anchor) => {
					var fragment_2 = root_1();
					var span = first_child(fragment_2);
					var a = child(span);
					var text = child(a, true);

					reset(a);
					reset(span);

					var text_1 = sibling(span);
					var a_1 = sibling(text_1);
					var text_2 = child(a_1, true);

					reset(a_1);

					var node_2 = sibling(a_1, 2);

					{
						var consequent = ($$anchor) => {
							var fragment_3 = root();
							var a_2 = sibling(first_child(fragment_3));
							var text_3 = child(a_2, true);

							reset(a_2);

							template_effect(
								($0) => {
									set_attribute(a_2, 'href', get(gitHistory).movedUrl);
									set_text(text_3, $0);
								},
								[
									() => get(gitHistory).movedUrl.split('/').slice(7).join('/')
								]
							);

							append($$anchor, fragment_3);
						};

						if_block(node_2, ($$render) => {
							if (get(gitHistory).status !== 'removed') $$render(consequent);
						});
					}

					var relative_time = sibling(node_2, 2);

					template_effect(() => set_custom_element_data(relative_time, 'datetime', get(gitHistory).commitDate));
					next();

					template_effect(
						($0) => {
							set_attribute(a, 'href', get(gitHistory).commitUrl);
							set_text(text, $0);
							set_text(text_1, ` ${get(gitHistory).status ?? ''} `);
							set_attribute(a_1, 'href', get(gitHistory).lastVersionUrl);
							set_text(text_2, get(gitHistory).oldFilename);
						},
						[
							() => new GitHubFileUrl(get(gitHistory).commitUrl).branch.slice(0, 8)
						]
					);

					append($$anchor, fragment_2);
				};

				var alternate = ($$anchor) => {};

				if_block(node_1, ($$render) => {
					if (get(gitHistory)) $$render(consequent_1); else $$render(alternate, -1);
				});
			}

			append($$anchor, fragment_1);
		}
	);

	reset(div);

	var div_1 = sibling(div, 2);
	var node_3 = child(div_1);

	await_block(
		node_3,
		getUrlToFileOnDefaultBranch,
		($$anchor) => {
			var text_6 = text('Loading default branch...');

			append($$anchor, text_6);
		},
		($$anchor, defaultBranchUrl) => {
			var fragment_5 = comment();
			var node_4 = first_child(fragment_5);

			{
				var consequent_2 = ($$anchor) => {
					var fragment_6 = root_2();
					var a_3 = first_child(fragment_6);
					var text_5 = child(a_3, true);

					reset(a_3);
					next();

					template_effect(() => {
						set_attribute(a_3, 'href', get(defaultBranchUrl));
						set_text(text_5, new GitHubFileUrl(get(defaultBranchUrl)).filePath);
					});

					append($$anchor, fragment_6);
				};

				if_block(node_4, ($$render) => {
					if (get(defaultBranchUrl)) $$render(consequent_2);
				});
			}

			append($$anchor, fragment_5);
		}
	);

	reset(div_1);
	append($$anchor, fragment);
	pop();
}

create_custom_element(Useful_not_found_page, {}, [], [], { mode: 'open' });

export { Useful_not_found_page as default };
