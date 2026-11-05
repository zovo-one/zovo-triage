import { onAbort } from '../npm/ztg-abort-utils-on-abort.js';
import debounceFunction from '../npm/ztg-debounce-fn.js';
import { isRepoRoot, isPRConversation, isDiscussion } from '../npm/ztg-github-url-detection.js';
import features from '../ztg-feature-manager.js';
import calculateCssCalcString from '../helpers/ztg-calculate-css-calc-string.js';
import observe from '../helpers/ztg-selector-observer.js';

const minimumViewportWidthForSidebar = 768; // Less than this, the layout is single-column

const sidebarSelector = [
	'#partial-discussion-sidebar', // `isDiscussion`, `isPRConversation`
	'div[class^="prc-PageLayout-Pane"]:has(> rails-partial[data-partial-name="codeViewRepoRoute.Sidebar"])', // `isRepoRoot`
];

let sidebar;

function updateStickiness() {
	if (!sidebar) {
		return;
	}

	const offset = calculateCssCalcString(getComputedStyle(sidebar).getPropertyValue('--rgh-sticky-sidebar-offset'));
	sidebar.classList.toggle(
		'rgh-sticky-sidebar',
		window.innerWidth >= minimumViewportWidthForSidebar
		&& sidebar.offsetHeight + offset <= window.innerHeight,
	);
}

const onResize = debounceFunction(updateStickiness, {wait: 100});
const sidebarObserver = new ResizeObserver(onResize);

// Avoid disabling the stickiness while the user is interacting with it
function toggleHoverState(event) {
	const isHovered = event.type === 'mouseenter';
	if (isHovered) {
		sidebarObserver.disconnect();
	} else {
		// Also immediately calls `onResize`, so it has the welcome side effect of unsticking the sidebar if its height changes
		sidebarObserver.observe(sidebar);
	}
}

// Can't use delegate because it's not efficient to track mouse events across the document
function trackSidebar(signal, foundSidebar) {
	sidebar = foundSidebar;
	sidebar.style.height = 'min-content';

	sidebarObserver.observe(sidebar);
	onAbort(signal, sidebarObserver, () => {
		sidebar = undefined;
	});

	sidebar.addEventListener('mouseenter', toggleHoverState, {signal});
	sidebar.addEventListener('mouseleave', toggleHoverState, {signal});
}

function init(signal) {
	document.documentElement.setAttribute('rgh-sticky-sidebar-enabled', '');

	// The element is recreated when the page is updated
	// `trackSidebar` also triggers the first update via `sidebarObserver.observe()`
	observe(sidebarSelector, trackSidebar.bind(undefined, signal), {signal});

	// Update it when the window is resized
	window.addEventListener('resize', onResize, {signal});
}

void features.add(import.meta.url, {
	include: [
		isRepoRoot,
		isPRConversation,
		isDiscussion,
	],
	exclude: [
		() => screen.availWidth < minimumViewportWidthForSidebar,
	],
	init,
});

/*

Test URLs:

- Repo: https://github.com/refined-github/refined-github
- PR conversation: https://github.com/refined-github/refined-github/pull/755
- Discussion: https://github.com/orgs/community/discussions/40299

*/
