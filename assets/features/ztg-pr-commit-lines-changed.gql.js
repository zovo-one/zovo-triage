var GetCommitChanges = "query GetCommitChanges($owner: String!, $name: String!, $commit: String!) {\n\trepository(owner: $owner, name: $name) {\n\t\tobject(expression: $commit) {\n\t\t\t... on Commit {\n\t\t\t\tadditions\n\t\t\t\tdeletions\n\t\t\t}\n\t\t}\n\t}\n}\n";

export { GetCommitChanges as default };
