var GetIssueLockStatus = "query GetIssueLockStatus($owner: String!, $name: String!, $number: Int!) {\n\trepository(owner: $owner, name: $name) {\n\t\tissueOrPullRequest(number: $number) {\n\t\t\t... on Lockable {\n\t\t\t\tlocked\n\t\t\t}\n\t\t}\n\t}\n}\n";

export { GetIssueLockStatus as default };
