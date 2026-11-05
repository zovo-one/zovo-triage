const DERIVED = 1 << 1;
const EFFECT = 1 << 2;
const RENDER_EFFECT = 1 << 3;
const MANAGED_EFFECT = 1 << 24;
const BLOCK_EFFECT = 1 << 4;
const BRANCH_EFFECT = 1 << 5;
const ROOT_EFFECT = 1 << 6;
const BOUNDARY_EFFECT = 1 << 7;
const CONNECTED = 1 << 9;
const CLEAN = 1 << 10;
const DIRTY = 1 << 11;
const MAYBE_DIRTY = 1 << 12;
const INERT = 1 << 13;
const DESTROYED = 1 << 14;
const REACTION_RAN = 1 << 15;
const DESTROYING = 1 << 25;
const EFFECT_TRANSPARENT = 1 << 16;
const EAGER_EFFECT = 1 << 17;
const HEAD_EFFECT = 1 << 18;
const EFFECT_PRESERVED = 1 << 19;
const USER_EFFECT = 1 << 20;
const EFFECT_OFFSCREEN = 1 << 25;
const WAS_MARKED = 1 << 16;
const REACTION_IS_UPDATING = 1 << 21;
const ASYNC = 1 << 22;
const ERROR_VALUE = 1 << 23;
const STATE_SYMBOL = Symbol('$state');
const LEGACY_PROPS = Symbol('legacy props');
const LOADING_ATTR_SYMBOL = Symbol('');
const ATTRIBUTES_CACHE = Symbol('attributes');
const CLASS_CACHE = Symbol('class');
const STYLE_CACHE = Symbol('style');
const TEXT_CACHE = Symbol('text');
const FORM_RESET_HANDLER = Symbol('form reset');
const STALE_REACTION = new (class StaleReactionError extends Error {
	name = 'StaleReactionError';
	message = 'The reaction that called `getAbortSignal()` was re-run or destroyed';
})();
const IS_XHTML =
	!!globalThis.document?.contentType &&
	 globalThis.document.contentType.includes('xml');
const TEXT_NODE = 3;
const COMMENT_NODE = 8;

export { ASYNC, ATTRIBUTES_CACHE, BLOCK_EFFECT, BOUNDARY_EFFECT, BRANCH_EFFECT, CLASS_CACHE, CLEAN, COMMENT_NODE, CONNECTED, DERIVED, DESTROYED, DESTROYING, DIRTY, EAGER_EFFECT, EFFECT, EFFECT_OFFSCREEN, EFFECT_PRESERVED, EFFECT_TRANSPARENT, ERROR_VALUE, FORM_RESET_HANDLER, HEAD_EFFECT, INERT, IS_XHTML, LEGACY_PROPS, LOADING_ATTR_SYMBOL, MANAGED_EFFECT, MAYBE_DIRTY, REACTION_IS_UPDATING, REACTION_RAN, RENDER_EFFECT, ROOT_EFFECT, STALE_REACTION, STATE_SYMBOL, STYLE_CACHE, TEXT_CACHE, TEXT_NODE, USER_EFFECT, WAS_MARKED };
