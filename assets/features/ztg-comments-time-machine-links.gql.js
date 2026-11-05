var GetCommitAtDate = "query GetCommitAtDate(\n\t$owner: String!\n\t$name: String!\n\t$branch: String!\n\t$date: GitTimestamp!\n) {\n\trepository(owner: $owner, name: $name) {\n\t\tref(qualifiedName: $branch) {\n\t\t\ttarget {\n\t\t\t\t... on Commit {\n\t\t\t\t\thistory(first: 1, until: $date) {\n\t\t\t\t\t\tnodes {\n\t\t\t\t\t\t\toid\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n}\n";

export { GetCommitAtDate as default };
