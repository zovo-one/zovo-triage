import { svgTagNames } from './ztg-svg-tag-names.js';

const svgTags = new Set(svgTagNames);
svgTags.delete('a');
svgTags.delete('audio');
svgTags.delete('canvas');
svgTags.delete('iframe');
svgTags.delete('script');
svgTags.delete('video');
const IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
const isFragment = (type) => type === DocumentFragment;
const setCSSProps = (element, style) => {
    for (const [name, value] of Object.entries(style)) {
        if (name.startsWith('-')) {
            element.style.setProperty(name, value);
        }
        else if (typeof value === 'number' && !IS_NON_DIMENSIONAL.test(name)) {
            element.style[name] = `${value}px`;
        }
        else {
            element.style[name] = value;
        }
    }
};
const create = (type) => {
    if (typeof type === 'string') {
        if (svgTags.has(type)) {
            return document.createElementNS('http://www.w3.org/2000/svg', type);
        }
        return document.createElement(type);
    }
    if (isFragment(type)) {
        return document.createDocumentFragment();
    }
    return type(type.defaultProps);
};
const setAttribute = (element, name, value) => {
    if (value === undefined || value === null) {
        return;
    }
    if (/^xlink[AHRST]/.test(name)) {
        element.setAttributeNS('http://www.w3.org/1999/xlink', name.replace('xlink', 'xlink:').toLowerCase(), value);
    }
    else {
        element.setAttribute(name, value);
    }
};
const addChildren = (parent, children) => {
    for (const child of children) {
        if (child instanceof Node) {
            parent.appendChild(child);
        }
        else if (Array.isArray(child)) {
            addChildren(parent, child);
        }
        else if (typeof child !== 'boolean'
            && child !== undefined
            && child !== null) {
            parent.appendChild(document.createTextNode(child));
        }
    }
};
const booleanishAttributes = new Set([
    'contentEditable',
    'draggable',
    'spellCheck',
    'value',
    'autoReverse',
    'externalResourcesRequired',
    'focusable',
    'preserveAlpha',
]);
const h = (type, attributes, ...children) => {
    var _a;
    const element = create(type);
    addChildren(element, children);
    if (element instanceof DocumentFragment || !attributes) {
        return element;
    }
    for (let [name, value] of Object.entries(attributes)) {
        if (name === 'htmlFor') {
            name = 'for';
        }
        if (name === 'class' || name === 'className') {
            const existingClassname = (_a = element.getAttribute('class')) !== null && _a !== void 0 ? _a : '';
            setAttribute(element, 'class', (existingClassname + ' ' + String(value)).trim());
        }
        else if (name === 'style') {
            setCSSProps(element, value);
        }
        else if (name.startsWith('on')) {
            const eventName = name.slice(2).toLowerCase().replace(/^-/, '');
            element.addEventListener(eventName, value);
        }
        else if (name === 'dangerouslySetInnerHTML' && '__html' in value) {
            element.innerHTML = value.__html;
        }
        else if (name === 'ref' && typeof value === 'function') {
            value(element);
        }
        else if (name !== 'key' && (booleanishAttributes.has(name) || value !== false)) {
            setAttribute(element, name, value === true ? '' : value);
        }
    }
    return element;
};
const Fragment = (typeof DocumentFragment === 'function' ? DocumentFragment : () => { });
const React = {
    createElement: h,
    Fragment,
};
const createElement = h;

export { Fragment, createElement, React as default, h };
