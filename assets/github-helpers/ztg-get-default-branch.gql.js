var GetDefaultBranch = "query getDefaultBranch($owner: String!, $name: String!) {\n\trepository(owner: $owner, name: $name) {\n\t\tdefaultBranchRef {\n\t\t\tname\n\t\t}\n\t}\n}\n";

export { GetDefaultBranch as default };
