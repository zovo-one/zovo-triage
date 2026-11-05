var GetFilesOnRoot = "query GetFilesOnRoot($owner: String!, $name: String!) {\n\trepository(owner: $owner, name: $name) {\n\t\tobject(expression: \"HEAD:\") {\n\t\t\t... on Tree {\n\t\t\t\tentries {\n\t\t\t\t\tname\n\t\t\t\t\ttype\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t}\n}\n";

export { GetFilesOnRoot as default };
