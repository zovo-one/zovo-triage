var GetWorkflows = "query GetWorkflows($owner: String!, $name: String!) {\n\trepository(owner: $owner, name: $name) {\n\t\tworkflowFiles: object(expression: \"HEAD:.github/workflows\") {\n\t\t\t... on Tree {\n\t\t\t\tentries {\n\t\t\t\t\tname\n\t\t\t\t\tobject {\n\t\t\t\t\t\t... on Blob {\n\t\t\t\t\t\t\ttext\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n}\n";

export { GetWorkflows as default };
