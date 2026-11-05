import { createElement } from './ztg-dom-chef.js';

const TriangleDownIcon = (props) => (
  createElement('svg', {
    className: "octicon octicon-triangle-down" ,
    xmlns: "http://www.w3.org/2000/svg",
    width: 16,
    height: 16,
    viewBox: "0 0 16 16"   ,
    role: "img",
    'aria-hidden': "true",
    ...props,}

    , createElement('path', { d: "m4.427 7.427 3.396 3.396a.25.25 0 0 0 .354 0l3.396-3.396A.25.25 0 0 0 11.396 7H4.604a.25.25 0 0 0-.177.427Z"                ,} )
  )
);

export { TriangleDownIcon as default };
