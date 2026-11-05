var CountBugs = "query CountBugs($owner: String!, $name: String!) {\n\trepository(owner: $owner, name: $name) {\n\t\tlabels(query: \"bug\", first: 10) {\n\t\t\tnodes {\n\t\t\t\tname\n\t\t\t\tissues(states: OPEN) {\n\t\t\t\t\ttotalCount\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\tissues(filterBy: { type: \"Bug\", states: OPEN }) {\n\t\t\ttotalCount\n\t\t}\n\t}\n}\n";

export { CountBugs as default };
