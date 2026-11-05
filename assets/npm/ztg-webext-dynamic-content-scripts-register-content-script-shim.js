import registerContentScript$1 from './ztg-content-scripts-register-polyfill-ponyfill.js';

const chromeRegister = globalThis.chrome?.scripting?.registerContentScripts;
const firefoxRegister = globalThis.browser?.contentScripts?.register;
async function registerContentScript(contentScript) {
    if (chromeRegister !== undefined) {
        const id = 'webext-dynamic-content-script-' + JSON.stringify(contentScript);
        try {
            await chrome.scripting.registerContentScripts([{
                    ...contentScript,
                    id,
                }]);
        }
        catch (error) {
            if (!error?.message.startsWith('Duplicate script ID')) {
                throw error;
            }
        }
        return {
            unregister: async () => chrome.scripting.unregisterContentScripts({ ids: [id] }),
        };
    }
    const firefoxContentScript = {
        ...contentScript,
        js: contentScript.js?.map(file => ({ file })),
        css: contentScript.css?.map(file => ({ file })),
    };
    if (firefoxRegister) {
        return firefoxRegister(firefoxContentScript);
    }
    return registerContentScript$1(firefoxContentScript);
}

export { chromeRegister, firefoxRegister, registerContentScript };
