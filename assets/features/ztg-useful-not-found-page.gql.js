var GetLatestCommitToFile = "query GetLatestCommitToFile(\n\t$owner: String!\n\t$name: String!\n\t$branch: String!\n\t$filePath: String!\n) {\n\trepository(owner: $owner, name: $name) {\n\t\tobject(expression: $branch) {\n\t\t\t... on Commit {\n\t\t\t\thistory(first: 1, path: $filePath) {\n\t\t\t\t\tnodes {\n\t\t\t\t\t\toid\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n}\n";

export { GetLatestCommitToFile as default };
