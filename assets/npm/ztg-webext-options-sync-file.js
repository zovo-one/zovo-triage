import { stringToBase64 } from './ztg-uint8array-extras.js';

const filePickerOptions = {
    types: [
        {
            accept: {
                'application/json': '.json',
            },
        },
    ],
};
const isModern = typeof showOpenFilePicker === 'function';
async function loadFileOld() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    const eventPromise = new Promise(resolve => {
        input.addEventListener('change', resolve, { once: true });
    });
    input.click();
    const event = await eventPromise;
    const file = event.target.files[0];
    if (!file) {
        throw new Error('No file selected');
    }
    return file.text();
}
async function saveFileOld(text, suggestedName) {
    const url = `data:application/json;base64,${stringToBase64(text)}`;
    const link = document.createElement('a');
    link.download = suggestedName;
    link.href = url;
    link.click();
}
async function loadFileModern() {
    const [fileHandle] = await showOpenFilePicker(filePickerOptions);
    const file = await fileHandle.getFile();
    return file.text();
}
async function saveFileModern(text, suggestedName) {
    const fileHandle = await showSaveFilePicker({
        ...filePickerOptions,
        suggestedName,
    });
    const writable = await fileHandle.createWritable();
    await writable.write(text);
    await writable.close();
}
const loadFile = isModern ? loadFileModern : loadFileOld;
const saveFile = isModern ? saveFileModern : saveFileOld;

export { loadFile, saveFile };
