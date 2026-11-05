var GetRepoAge = "query GetRepoAge($owner: String!, $name: String!, $cursor: String!) {\n\trepository(owner: $owner, name: $name) {\n\t\tdefaultBranchRef {\n\t\t\ttarget {\n\t\t\t\t... on Commit {\n\t\t\t\t\thistory(first: 5, after: $cursor) {\n\t\t\t\t\t\tnodes {\n\t\t\t\t\t\t\tcommittedDate\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n}\n";

export { GetRepoAge as default };
