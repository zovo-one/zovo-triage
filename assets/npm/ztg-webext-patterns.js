const patternValidationRegex = /^(https?|wss?|file|ftp|\*):\/\/(\*|\*\.[^*/]+|[^*/]+)\/.*$|^file:\/\/\/.*$|^resource:\/\/(\*|\*\.[^*/]+|[^*/]+)\/.*$|^about:/;
const isFirefox = globalThis.navigator?.userAgent.includes('Firefox/');
const allStarsRegex = isFirefox
    ? /^(https?|wss?):[/][/][^/]+([/].*)?$/
    : /^https?:[/][/][^/]+([/].*)?$/;
const allUrlsRegex = /^(https?|file|ftp):[/]+/;
function assertValidPattern(matchPattern) {
    if (!isValidPattern(matchPattern)) {
        throw new Error(matchPattern + ' is an invalid pattern. See https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns for more info.');
    }
}
function isValidPattern(matchPattern) {
    return matchPattern === '<all_urls>' || patternValidationRegex.test(matchPattern);
}
function doesUrlMatchPatterns(url, ...patterns) {
    if (patterns.includes('<all_urls>') && allUrlsRegex.test(url)) {
        return true;
    }
    if (patterns.includes('*://*/*') && allStarsRegex.test(url)) {
        return true;
    }
    for (const pattern of patterns) {
        if (patternToRegex(pattern).test(url)) {
            return true;
        }
    }
    return false;
}
function findMatchingPatterns(url, ...patterns) {
    return patterns.filter(pattern => doesUrlMatchPatterns(url, pattern));
}
function getRawPatternRegex(matchPattern) {
    assertValidPattern(matchPattern);
    let [, protocol, host = '', pathname] = matchPattern.split(/(^[^:]+:[/][/])([^/]+)?/);
    protocol = protocol
        .replace('*', isFirefox ? '(https?|wss?)' : 'https?')
        .replaceAll(/[/]/g, '[/]');
    if (host === '*') {
        host = '[^/]+';
    }
    host &&= host
        .replace(/^[*][.]/, '([^/]+.)*')
        .replaceAll(/[.]/g, '[.]')
        .replace(/[*]$/, '[^.]+');
    pathname = pathname
        .replaceAll(/[/]/g, '[/]')
        .replaceAll(/[.]/g, '[.]')
        .replaceAll(/[*]/g, '.*');
    return '^' + protocol + host + '(' + pathname + ')?$';
}
function patternToRegex(...matchPatterns) {
    if (matchPatterns.length === 0) {
        return /$./;
    }
    if (matchPatterns.includes('<all_urls>')) {
        return allUrlsRegex;
    }
    if (matchPatterns.includes('*://*/*')) {
        return allStarsRegex;
    }
    return new RegExp(matchPatterns.map(x => getRawPatternRegex(x)).join('|'));
}
function excludeDuplicatePatterns(matchPatterns) {
    if (matchPatterns.includes('<all_urls>')) {
        return ['<all_urls>'];
    }
    if (matchPatterns.includes('*://*/*')) {
        return ['*://*/*'];
    }
    const uniquePatterns = [...new Set(matchPatterns)];
    return uniquePatterns.filter(possibleSubset =>
    !uniquePatterns.some(possibleSuperset =>
    possibleSubset !== possibleSuperset
        && patternToRegex(possibleSuperset).test(possibleSubset)));
}

export { allStarsRegex, allUrlsRegex, assertValidPattern, doesUrlMatchPatterns, excludeDuplicatePatterns, findMatchingPatterns, isValidPattern, patternToRegex, patternValidationRegex };
