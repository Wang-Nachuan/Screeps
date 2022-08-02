/* File: cache/map.ts
 * Map between "Memory" and "global.cache"
 */

class Ref {

    memoryRef: any;
    cacheRef: any;
    classObj: any;          // Class must contain "cacheRead" and "cacheWrite" functions

    constructor(memoryKeys: string[], cacheKeys: string[], classObj: any) {
        this.memoryRef = Memory;
        this.cacheRef = global.cache;
        this.classObj = classObj;
        for (let key of memoryKeys) {
            this.memoryRef = this.memoryRef[key];
        }
        for (let key of cacheKeys) {
            this.cacheRef = this.cacheRef[key];
        }
    }

    read() {
        let memoryRef = Memory;
        let cacheRef = global.cache;


    }

    write() {

    }
}

export const map = {

}