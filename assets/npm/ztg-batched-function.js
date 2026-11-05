async function delay_(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}
function batchedFunction(function_, { delay = undefined } = {}) {
    if (typeof delay !== 'number' && delay !== undefined) {
        throw new TypeError(`Expected \`interval\` to be of type \`number\` but received type \`${typeof delay}\``);
    }
    let queue = [];
    let isRunning = false;
    return value => {
        queue.push(value);
        if (isRunning) {
            return;
        }
        isRunning = true;
        (async () => {
            if (delay !== undefined) {
                await delay_(delay);
            }
            do {
                const oldQueue = queue;
                queue = [];
                let promise = function_(oldQueue);
                if (delay !== undefined) {
                    promise = Promise.all([
                        promise,
                        delay_(delay),
                    ]);
                }
                await promise;
            } while (queue.length > 0);
            isRunning = false;
        })();
    };
}

export { batchedFunction as default };
