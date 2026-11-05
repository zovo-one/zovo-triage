var GetReleasesCount = "query GetReleasesCount($owner: String!, $name: String!) {\n\trepository(owner: $owner, name: $name) {\n\t\treleases {\n\t\t\ttotalCount\n\t\t}\n\t\ttags: refs(refPrefix: \"refs/tags/\") {\n\t\t\ttotalCount\n\t\t}\n\t}\n}\n";

export { GetReleasesCount as default };
