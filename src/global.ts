/**
 *  Global function/constants 
 */

declare function getObjectInCache(isId: boolean, ref: Id<_HasId> | MemRef): any;
declare function derefMem(ref: MemRef): any;
declare function getCreepName(roomName: string, role: string): string;

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
    let itr = Memory;
    for (let key of ref) {
        itr = itr[key];
    }
    return itr;
}

// Generate an unique name for creep
global.getCreepName = function(roomName: string, role: string): string {
    let record = Memory.room[roomName].data.nameIdx[role];
    let idx = 0;
    while (true) {
        idx += 1;
        if (record.indexOf(idx) == -1) {
            record.push(idx);
            return roomName + '-' + role + idx.toString();
        }
    }
}

