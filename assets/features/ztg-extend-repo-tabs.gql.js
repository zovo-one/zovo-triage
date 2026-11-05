var RepoCountInfo = "query RepoCountInfo($owner: String!, $name: String!) {\n\trepository(owner: $owner, name: $name) {\n\t\tprojectsV2 {\n\t\t\ttotalCount\n\t\t}\n\t\tdefaultBranchRef {\n\t\t\ttarget {\n\t\t\t\t... on Commit {\n\t\t\t\t\tcheckSuites {\n\t\t\t\t\t\ttotalCount\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n}\n";

export { RepoCountInfo as default };
