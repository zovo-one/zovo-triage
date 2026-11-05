var previousVersionQuery = "query getPreviousCommitForFile($resource: URI!, $filePath: String!) {\n\tresource(url: $resource) {\n\t\t... on Commit {\n\t\t\thistory(path: $filePath, first: 2) {\n\t\t\t\tnodes {\n\t\t\t\t\toid\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n}\n";

export { previousVersionQuery as default };
