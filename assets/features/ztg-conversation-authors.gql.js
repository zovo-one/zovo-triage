var GetCollaborators = "query GetMaintainers($owner: String!, $name: String!) {\n\trepository(owner: $owner, name: $name) {\n\t\tcollaborators(first: 100, affiliation: ALL) {\n\t\t\tnodes {\n\t\t\t\tlogin\n\t\t\t}\n\t\t}\n\t}\n}\n";

export { GetCollaborators as default };
