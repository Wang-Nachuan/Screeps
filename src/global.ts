/**
 *  Global functions, for code reuse and preventing conflict
 */


declare function pubTask(): void;
declare function signal(): void;
declare function derefMem(ref: MemRef): any;

global.pubTask = function(): void {
    // TODO
}

global.signal = function(): void {
    // TODO
}

global.derefMem = function(ref: MemRef): any {
    let itr = Memory;
    for (let key of ref) {
        itr = itr[key];
    }
    return itr;
}