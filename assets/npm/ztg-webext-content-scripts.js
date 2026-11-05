import chromeP from './ztg-webext-polyfill-kinda.js';
import { patternToRegex } from './ztg-webext-patterns.js';

const gotScripting = Boolean(globalThis.chrome?.scripting);
function castTarget(target) {
    return typeof target === 'object' ? target : {
        tabId: target,
        frameId: 0,
    };
}
function castAllFramesTarget(target) {
    if (typeof target === 'object') {
        return { ...target, allFrames: false };
    }
    return {
        tabId: target,
        frameId: undefined,
        allFrames: true,
    };
}
function castArray(possibleArray) {
    if (Array.isArray(possibleArray)) {
        return possibleArray;
    }
    return [possibleArray];
}
function normalizeFiles(files, seen = []) {
    return files
        .map(file => typeof file === 'string' ? { file } : file)
        .filter(content => {
        if ('code' in content) {
            return true;
        }
        const file = typeof content === 'string' ? content : content.file;
        if (seen.includes(file)) {
            console.debug(`Duplicated file not injected: ${file}`);
            return false;
        }
        seen.push(file);
        return true;
    });
}
const nativeFunction = /^function \w+\(\) {[\n\s]+\[native code][\n\s]+}/;
async function executeFunction(target, function_, ...arguments_) {
    if (nativeFunction.test(String(function_))) {
        throw new TypeError('Native functions need to be wrapped first, like `executeFunction(1, () => alert(1))`');
    }
    const { frameId, tabId } = castTarget(target);
    if (gotScripting) {
        const [injection] = await chrome.scripting.executeScript({
            target: {
                tabId,
                frameIds: [frameId],
            },
            func: function_,
            args: arguments_,
        });
        return injection?.result;
    }
    const [result] = await chromeP.tabs.executeScript(tabId, {
        code: `(${function_.toString()})(...${JSON.stringify(arguments_)})`,
        matchAboutBlank: true,
        frameId,
    });
    return result;
}
function arrayOrUndefined(value) {
    return value === undefined ? undefined : [value];
}
async function insertCSS({ tabId, frameId, files, allFrames, matchAboutBlank, runAt, }, { ignoreTargetErrors } = {}) {
    const normalizedFiles = normalizeFiles(files);
    const everyInsertion = Promise.all(normalizedFiles.map(async (content) => {
        if (gotScripting) {
            return chrome.scripting.insertCSS({
                target: {
                    tabId,
                    frameIds: arrayOrUndefined(frameId),
                    allFrames: frameId === undefined ? allFrames : undefined,
                },
                files: 'file' in content ? [content.file] : undefined,
                css: 'code' in content ? content.code : undefined,
            });
        }
        return chromeP.tabs.insertCSS(tabId, {
            ...content,
            matchAboutBlank,
            allFrames,
            frameId,
            runAt: runAt ?? 'document_start',
        });
    }));
    if (ignoreTargetErrors) {
        await catchTargetInjectionErrors(everyInsertion);
    }
    else {
        await everyInsertion;
    }
}
function assertNoCode(files) {
    if (files.some(content => 'code' in content)) {
        throw new Error('chrome.scripting does not support injecting strings of `code`');
    }
}
async function executeScript({ tabId, frameId, files, allFrames, matchAboutBlank, runAt, }, { ignoreTargetErrors } = {}) {
    const normalizedFiles = normalizeFiles(files);
    if (gotScripting) {
        assertNoCode(normalizedFiles);
        const injection = chrome.scripting.executeScript({
            target: {
                tabId,
                frameIds: arrayOrUndefined(frameId),
                allFrames: frameId === undefined ? allFrames : undefined,
            },
            files: normalizedFiles.map(({ file }) => file),
        });
        if (ignoreTargetErrors) {
            await catchTargetInjectionErrors(injection);
        }
        else {
            await injection;
        }
        return;
    }
    const executions = [];
    for (const content of normalizedFiles) {
        if ('code' in content) {
            await executions.at(-1);
        }
        executions.push(chromeP.tabs.executeScript(tabId, {
            ...content,
            matchAboutBlank,
            allFrames,
            frameId,
            runAt,
        }));
    }
    if (ignoreTargetErrors) {
        await catchTargetInjectionErrors(Promise.all(executions));
    }
    else {
        await Promise.all(executions);
    }
}
async function getTabsByUrl(matches, excludeMatches) {
    if (matches.length === 0) {
        return [];
    }
    const exclude = excludeMatches ? patternToRegex(...excludeMatches) : undefined;
    const tabs = await chromeP.tabs.query({ url: matches });
    return tabs
        .filter(tab => tab.id && tab.url && (exclude ? !exclude.test(tab.url) : true))
        .map(tab => tab.id);
}
async function injectContentScript(where, scripts, options = {}) {
    const targets = castArray(where);
    await Promise.all(targets.map(async (target) => injectContentScriptInSpecificTarget(castAllFramesTarget(target), scripts, options)));
}
async function injectContentScriptInSpecificTarget({ frameId, tabId, allFrames }, scripts, options = {}) {
    const seen = [];
    const injections = castArray(scripts).flatMap(script => {
        const css = normalizeFiles(script.css ?? [], seen);
        const js = normalizeFiles(script.js ?? [], seen);
        return [
            css.length > 0 && insertCSS({
                tabId,
                frameId,
                allFrames,
                files: css,
                matchAboutBlank: script.matchAboutBlank ?? script.match_about_blank,
                runAt: script.runAt ?? script.run_at,
            }, options),
            js.length > 0 && executeScript({
                tabId,
                frameId,
                allFrames,
                files: js,
                matchAboutBlank: script.matchAboutBlank ?? script.match_about_blank,
                runAt: script.runAt ?? script.run_at,
            }, options),
        ];
    });
    await Promise.all(injections);
}
const blockedPrefixes = [
    'chrome.google.com/webstore',
    'chromewebstore.google.com',
    'accounts-static.cdn.mozilla.net',
    'accounts.firefox.com',
    'addons.cdn.mozilla.net',
    'addons.mozilla.org',
    'api.accounts.firefox.com',
    'content.cdn.mozilla.net',
    'discovery.addons.mozilla.org',
    'input.mozilla.org',
    'install.mozilla.org',
    'oauth.accounts.firefox.com',
    'profile.accounts.firefox.com',
    'support.mozilla.org',
    'sync.services.mozilla.com',
    'testpilot.firefox.com',
];
function isScriptableUrl(url) {
    if (!url?.startsWith('http')) {
        return false;
    }
    const cleanUrl = url.replace(/^https?:\/\//, '');
    return blockedPrefixes.every(blocked => !cleanUrl.startsWith(blocked));
}
const targetErrors = /^No frame with id \d+ in tab \d+.$|^No tab with id: \d+.$|^The tab was closed.$|^The frame was removed.$/;
async function catchTargetInjectionErrors(promise) {
    try {
        await promise;
    }
    catch (error) {
        if (!targetErrors.test(error?.message)) {
            throw error;
        }
    }
}

export { executeFunction, executeScript, getTabsByUrl, injectContentScript, insertCSS, isScriptableUrl };
