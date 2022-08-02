'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// export const loop = errorMapper(() => {
//     let testObj: Zoo = new Zoo(['dog', 'cat'], ['doggy', 'catty'])
//     console.log(testObj);
// }, true)
const loop = function () {
    // Caching
    if (!global.resetFlag) {
        global.resetFlag = true;
        console.log('[Message] Global reset.');
        // Rebuild cache instance
    }
};

exports.loop = loop;
//# sourceMappingURL=main.js.map
