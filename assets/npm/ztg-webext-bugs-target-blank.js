import filterAlteredClicks from './ztg-filter-altered-clicks.js';
import { isSafari } from './ztg-webext-bugs-webext-detect.js';

function isLinkExternal(link) {
    return link.target === '_blank'
        || (!link.target
            && Boolean(document.querySelector('base[target="_blank"]'))
        );
}
if ('window' in globalThis && 'open' in globalThis && isSafari()) {
    document.addEventListener('click', filterAlteredClicks(event => {
        const clicked = event.composedPath().find(element => element instanceof HTMLAnchorElement);
        if (clicked && isLinkExternal(clicked)) {
            event.preventDefault();
            window.open(clicked.href);
        }
    }));
}
