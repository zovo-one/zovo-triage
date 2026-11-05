var GetReleases = "query GetReleases($owner: String!, $name: String!) {\n\trepository(owner: $owner, name: $name) {\n\t\treleases(first: 100) {\n\t\t\tnodes {\n\t\t\t\ttagName\n\t\t\t}\n\t\t}\n\t}\n}\n";

export { GetReleases as default };
