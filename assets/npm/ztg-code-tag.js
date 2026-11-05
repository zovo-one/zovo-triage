const concatenateTemplateLiteralTag = (raw, ...keys) => keys.length === 0 ? raw[0] : String.raw({ raw }, ...keys);
const any = concatenateTemplateLiteralTag;

export { any, any as css, any as gql, any as graphql, any as html, any as markdown, any as md, any as sql };
