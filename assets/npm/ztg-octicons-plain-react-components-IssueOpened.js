import { createElement } from './ztg-dom-chef.js';

const IssueOpenedIcon = (props) => (
  createElement('svg', {
    className: "octicon octicon-issue-opened" ,
    xmlns: "http://www.w3.org/2000/svg",
    width: 16,
    height: 16,
    viewBox: "0 0 16 16"   ,
    role: "img",
    'aria-hidden': "true",
    ...props,}

    , createElement('path', { d: "M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"             ,} )
    , createElement('path', { d: "M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"                          ,} )
  )
);

export { IssueOpenedIcon as default };
