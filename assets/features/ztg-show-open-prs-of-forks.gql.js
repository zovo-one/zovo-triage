var GetPRs = "query GetPRs($query: String!) {\n\tsearch(first: 100, type: ISSUE, query: $query) {\n\t\tnodes {\n\t\t\t... on PullRequest {\n\t\t\t\tnumber\n\t\t\t\theadRepository {\n\t\t\t\t\tnameWithOwner\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n}\n";

export { GetPRs as default };
