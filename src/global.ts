/**
 *  Global function/constants 
 */

declare function enref(obj: any): Ref | null;
declare function deref(ref: Ref): any;
declare function derefMem(ref: RefMem) : any;

global.enref = function(obj: any): Ref | null {
    let ref: Ref;
    if (!obj) {
        console.log("[ERROR] Function 'enref()': undefined input object");
        return null;
    }
    if (obj.id) {
        ref.id = obj.id;
        return ref;
    } else {
        ref.flagName = obj.name;
        return ref;
    }
}

global.deref = function(ref: Ref): any {
    if (ref.id) {
        return Game.getObjectById(ref.id);
    }
    if (ref.flagName) {
        return Game.flags[ref.flagName];
    }
    console.log("[ERROR] Function 'deref()': empty input reference");
    return null;
}

global.derefMem = function(ref: RefMem): any {
    let itr: any = Memory;
    for (let key in ref) {
        itr = itr[key];
    }
    return itr;
}
