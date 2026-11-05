import { PUBLIC_VERSION } from './ztg-svelte-version.js';

if (typeof window !== 'undefined') {
	((window.__svelte ??= {}).v ??= new Set()).add(PUBLIC_VERSION);
}
