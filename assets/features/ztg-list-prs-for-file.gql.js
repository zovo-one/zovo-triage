var listPrsForFileQuery = "query getPrsByFile($owner: String!, $name: String!, $defaultBranch: String!) {\n\trepository(owner: $owner, name: $name) {\n\t\tpullRequests(\n\t\t\tfirst: 25\n\t\t\tstates: OPEN\n\t\t\tbaseRefName: $defaultBranch\n\t\t\torderBy: { field: UPDATED_AT, direction: DESC }\n\t\t) {\n\t\t\tnodes {\n\t\t\t\tnumber\n\t\t\t\tfiles(first: 100) {\n\t\t\t\t\tnodes {\n\t\t\t\t\t\tpath\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n}\n";

export { listPrsForFileQuery as default };
