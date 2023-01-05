'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 *  Global function/constants
 */
// Ref can be either Id<_HasId> or MemRef type
global.getObjectInCache = function (isId, ref) {
    if (isId) {
        let obj = global.cache.log[ref];
        if (!obj) {
            console.log("[WARNING] Function 'getObjectInCache()': object not found in cache");
            return null;
        }
        else {
            return obj;
        }
    }
    else {
        let itr = global.cache;
        for (let key in ref) {
            itr = itr[key];
        }
        return itr;
    }
};
global.derefMem = function (ref) {
    let itr = Memory;
    for (let key in ref) {
        itr = itr[key];
    }
    return itr;
};

// export const loop = errorMapper(() => {
//     let testObj: Zoo = new Zoo(['dog', 'cat'], ['doggy', 'catty'])
//     console.log(testObj);
// }, true)
const loop = function () {
    // // Initialize memory
    // if (!Memory.initFlag) {
    //     Memory.initFlag = true;
    //     /* TODO: initialize memory */
    //     console.log('[MESSAGE] Memory initialized');
    // }
    // // Caching
    // if (!global.cache) {
    //     global.cache = new Cache();
    //     console.log('[MESSAGE] Global reset');
    // } 
    test(10, 'aaaaa');
    test(20);
};
function test(a, b) {
    console.log(a);
    if (b) {
        console.log('true!');
    }
    else {
        console.log('false!');
    }
}

exports.loop = loop;
//# sourceMappingURL=main.js.map
