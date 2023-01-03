'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 *  Global function/constants
 */
global.enref = function (obj) {
    let ref;
    if (!obj) {
        console.log("[ERROR] Function 'enref()': undefined input object");
        return null;
    }
    if (obj.id) {
        ref.id = obj.id;
        return ref;
    }
    else {
        ref.flagName = obj.name;
        return ref;
    }
};
global.deref = function (ref) {
    if (ref.id) {
        return Game.getObjectById(ref.id);
    }
    if (ref.flagName) {
        return Game.flags[ref.flagName];
    }
    console.log("[ERROR] Function 'deref()': empty input reference");
    return null;
};

// export const loop = errorMapper(() => {
//     let testObj: Zoo = new Zoo(['dog', 'cat'], ['doggy', 'catty'])
//     console.log(testObj);
// }, true)
const loop = function () {
    // Initialize memory
    if (!Memory.initFlag) {
        Memory.initFlag = true;
        /* TODO: initialize memory */
        console.log('[MESSAGE] Memory initialized');
    }
    // Caching
    if (!global.resetFlag) {
        global.resetFlag = true;
        console.log('[MESSAGE] Global reset');
        /* TODO: Rebuild all objects */
    }
};

exports.loop = loop;
//# sourceMappingURL=main.js.map
