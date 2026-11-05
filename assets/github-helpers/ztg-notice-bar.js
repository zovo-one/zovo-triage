import { clsx } from '../npm/ztg-clsx-clsx.js';
import React from '../npm/ztg-dom-chef.js';
import elementReady from '../npm/ztg-element-ready.js';
import XIcon from '../npm/ztg-octicons-plain-react-components-X.js';

/** https://primer.style/css/components/alerts */
async function addNotice(
	message,
	{
		type = 'notice',
		action = (
			React.createElement('button', { className: "flash-close js-flash-close" , type: "button", 'aria-label': "Dismiss this message"  ,}
, React.createElement(XIcon, null )
)
		),
	} = {},
) {
	const container = await elementReady('#js-flash-container');
	container.append(
		React.createElement('div', { className: clsx('flash flash-full', `flash-${type}`, 'px-4 tmp-px-3'),}
, action
, React.createElement('div', null
, message
)
),
	);
}

export { addNotice as default };
