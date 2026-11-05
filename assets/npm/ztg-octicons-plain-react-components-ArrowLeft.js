import { createElement } from './ztg-dom-chef.js';

const ArrowLeftIcon = (props) => (
  createElement('svg', {
    className: "octicon octicon-arrow-left" ,
    xmlns: "http://www.w3.org/2000/svg",
    width: 16,
    height: 16,
    viewBox: "0 0 16 16"   ,
    role: "img",
    'aria-hidden': "true",
    ...props,}

    , createElement('path', { d: "M7.78 12.53a.75.75 0 0 1-1.06 0L2.47 8.28a.75.75 0 0 1 0-1.06l4.25-4.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L4.81 7h7.44a.75.75 0 0 1 0 1.5H4.81l2.97 2.97a.75.75 0 0 1 0 1.06Z"                               ,} )
  )
);

export { ArrowLeftIcon as default };
