var HasChecks = "query HasChecks($owner: String!, $name: String!) {\n\trepository(owner: $owner, name: $name) {\n\t\thead: object(expression: \"HEAD\") {\n\t\t\t... on Commit {\n\t\t\t\thistory(first: 10) {\n\t\t\t\t\tnodes {\n\t\t\t\t\t\tstatusCheckRollup {\n\t\t\t\t\t\t\tstate\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n}\n";

export { HasChecks as default };
