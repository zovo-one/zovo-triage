import { isBackground } from './ztg-webext-detect.js';
import { init, deleteWithLogic } from './ztg-webext-storage-cache-shared.js';

const globalCache = {
    clear: deleteWithLogic,
};
if (isBackground()) {
    init();
}

export { globalCache };
