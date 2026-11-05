import toMilliseconds from './ztg-@sindresorhus-to-milliseconds.js';

function timeInTheFuture(time) {
    return Date.now() + toMilliseconds(time);
}
async function readItem(userKey) {
    const internalKey = `cache:${userKey}`;
    const storageData = await chrome.storage.local.get(internalKey);
    const item = storageData[internalKey];
    return item !== undefined && Date.now() <= item.maxAge ? item : undefined;
}
async function writeItem(userKey, data, maxAge) {
    const set = async () => {
        await chrome.storage.local.set({
            [`cache:${userKey}`]: {
                data,
                maxAge: timeInTheFuture(maxAge),
            },
        });
    };
    try {
        await set();
    }
    catch {
        await deleteExpired();
        await set();
    }
    return data;
}
async function deleteItem(userKey) {
    await chrome.storage.local.remove(`cache:${userKey}`);
}
async function deleteWithLogic(shouldDelete) {
    const storageKeys = await chrome.storage.local.getKeys();
    const cacheKeys = storageKeys.filter(key => key.startsWith('cache:'));
    if (cacheKeys.length === 0) {
        return;
    }
    if (shouldDelete === undefined) {
        await chrome.storage.local.remove(cacheKeys);
        return;
    }
    const wholeCache = await chrome.storage.local.get(cacheKeys);
    const removableKeys = [];
    for (const [key, item] of Object.entries(wholeCache)) {
        if ((shouldDelete(item))) {
            removableKeys.push(key);
        }
    }
    if (removableKeys.length > 0) {
        await chrome.storage.local.remove(removableKeys);
    }
}
async function deleteExpired() {
    await deleteWithLogic(item => Date.now() > item.maxAge);
}
const ALARM_NAME = 'webext-storage-cache';
function init() {
    if (chrome.alarms) {
        void chrome.alarms.create(ALARM_NAME, {
            delayInMinutes: 1,
            periodInMinutes: 60 * 24,
        });
        let lastRun = 0;
        chrome.alarms.onAlarm.addListener(alarm => {
            if (!(alarm.name === ALARM_NAME && lastRun < Date.now() - 1000)) {
                return;
            }
            lastRun = Date.now();
            void deleteExpired();
        });
    }
    else {
        setTimeout(deleteExpired, 60_000);
        setInterval(deleteExpired, 1000 * 3600 * 24);
    }
}

export { deleteExpired, deleteItem, deleteWithLogic, init, readItem, timeInTheFuture, writeItem };
