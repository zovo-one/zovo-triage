import { createElement } from './ztg-dom-chef.js';

const DotFillIcon = (props) => (
  createElement('svg', {
    className: "octicon octicon-dot-fill" ,
    xmlns: "http://www.w3.org/2000/svg",
    width: 16,
    height: 16,
    viewBox: "0 0 16 16"   ,
    role: "img",
    'aria-hidden': "true",
    ...props,}

    , createElement('path', { d: "M8 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z"             ,} )
  )
);

export { DotFillIcon as default };
