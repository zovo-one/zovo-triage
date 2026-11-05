var GetRepoInfo = "query GetRepositoryInfo($owner: String!, $name: String!) {\n\trepository(owner: $owner, name: $name) {\n\t\tstargazerCount\n\t\tisPrivate\n\t\tviewerHasStarred\n\t\tviewerPermission\n\t\tisEmpty\n\t\tforked: parent {\n\t\t\turl\n\t\t}\n\t\tdefaultBranchRef {\n\t\t\ttarget {\n\t\t\t\t... on Commit {\n\t\t\t\t\thistory(first: 3) {\n\t\t\t\t\t\tnodes {\n\t\t\t\t\t\t\toid\n\t\t\t\t\t\t\tstatusCheckRollup {\n\t\t\t\t\t\t\t\tstate\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n}\n";

export { GetRepoInfo as default };
