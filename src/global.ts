/**
 *  Global function/constants 
 */

// 
declare function getObjectInCache(isId: boolean, ref: Id<_HasId> | MemRef): any;
declare function derefMem(ref: MemRef): any;

// Ref can be either Id<_HasId> or MemRef type
global.getObjectInCache = function(isId: boolean, ref: any): any {
    if (isId) {
        let obj = global.cache.log[ref];
        if (!obj) {
            console.log("[WARNING] Function 'getObjectInCache()': object not found in cache");
            return null;
        } else {
            return obj;
        }
    } else {
        let itr = global.cache;
        for (let key in ref) {
            itr = itr[key];
        }
        return itr;
    }
    
}

global.derefMem = function(ref: MemRef): any {
    let itr: any = Memory;
    for (let key in ref) {
        itr = itr[key];
    }
    return itr;
}

