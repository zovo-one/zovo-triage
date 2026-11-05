var GetFirstCommit = "query GetFirstCommit($owner: String!, $name: String!) {\n\trepository(owner: $owner, name: $name) {\n\t\tdefaultBranchRef {\n\t\t\ttarget {\n\t\t\t\t... on Commit {\n\t\t\t\t\toid\n\t\t\t\t\tcommittedDate\n\t\t\t\t\tresourcePath\n\t\t\t\t\thistory {\n\t\t\t\t\t\ttotalCount\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n}\n";

export { GetFirstCommit as default };
