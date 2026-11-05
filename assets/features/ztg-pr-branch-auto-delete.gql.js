var GetPrsToBaseBranchAndDeleteOnMerge = "query GetPrsToBaseBranchAndDeleteOnMerge(\n\t$owner: String!\n\t$name: String!\n\t$baseRefName: String!\n) {\n\trepository(owner: $owner, name: $name) {\n\t\tpullRequests(baseRefName: $baseRefName, states: OPEN) {\n\t\t\ttotalCount\n\t\t}\n\t\tdeleteBranchOnMerge\n\t}\n}\n";

export { GetPrsToBaseBranchAndDeleteOnMerge as default };
