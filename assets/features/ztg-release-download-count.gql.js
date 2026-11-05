var getReleaseDownloadCount = "query getReleaseDownloadCount($owner: String!, $name: String!, $tag: String!) {\n\trepository(owner: $owner, name: $name) {\n\t\trelease(tagName: $tag) {\n\t\t\treleaseAssets(first: 100) {\n\t\t\t\tnodes {\n\t\t\t\t\tname\n\t\t\t\t\tdownloadCount\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n}\n";

export { getReleaseDownloadCount as default };
