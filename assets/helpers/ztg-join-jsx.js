import React from '../npm/ztg-dom-chef.js';

function joinJsx(
	separator,
	items,
) {
	return (
		React.createElement(React.Fragment, null
, items.map((item, index) => (
				React.createElement(React.Fragment, null
, index > 0 && separator
, item
)
			))
)
	);
}

export { joinJsx as default };
