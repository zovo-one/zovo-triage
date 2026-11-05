var HasAnyProjects = "query GetProjectCount($owner: String!, $name: String!) {\n\trepository(owner: $owner, name: $name) {\n\t\tprojectsV2 {\n\t\t\ttotalCount\n\t\t}\n\t}\n\torganization(login: $owner) {\n\t\tprojectsV2 {\n\t\t\ttotalCount\n\t\t}\n\t}\n}\n";

export { HasAnyProjects as default };
