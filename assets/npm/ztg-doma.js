const doma = (html) => {
    if (html === undefined || html === null) {
        return new DocumentFragment();
    }
    const template = document.createElement('template');
    template.innerHTML = html;
    return template.content;
};
doma.one = (html) => doma(html).firstElementChild ?? undefined;

export { doma as default };
