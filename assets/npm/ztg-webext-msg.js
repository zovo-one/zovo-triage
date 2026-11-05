import { deserializeError, serializeError } from './ztg-serialize-error.js';

function handleMessages(handlers) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        for (const id of Object.keys(message)) {
            if (id in handlers) {
                (async () => {
                    try {
                        const result = await handlers[id](message[id], sender);
                        sendResponse(result);
                    }
                    catch (error) {
                        sendResponse({ $$error: serializeError(error) });
                        throw error;
                    }
                })();
                return true;
            }
        }
    });
}
function throwIfError(response) {
    if (response?.$$error) {
        throw new Error(response.$$error.message, {
            cause: deserializeError(response.$$error),
        });
    }
}
async function messageRuntime(message) {
    const response = await chrome.runtime.sendMessage(message);
    throwIfError(response);
    return response;
}

export { handleMessages, messageRuntime };
