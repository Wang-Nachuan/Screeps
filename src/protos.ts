/**
 *  Prototype classes
 */

import {Mem} from "./memory/mem";

// // For game objects (which have fixed memory space)
// export abstract class ObjectProto {

//     // Write back latest data to memory
//     abstract wb();

//     // Unzip and load the object with package data
//     abstract load();

//     // Wrapper function
//     abstract exe();
// }

// For meta data (which does not have fixed memory space)
// export abstract class DataProto {

//     // Compress data to a compact package (to be stored in memory)
//     abstract zip(): any;

//     // Unzip and load the object with package data
//     abstract unzip(pkg: any);
// }

export abstract class ObjectProto {
    readonly type: string = '';
    private _addr: Addr;
    private _mem: MemoryBlock;
    private _obj: any

    // Game object and parameters must be provided at first instantiation
    constructor(addr: Addr, obj?: any, para?: {[name: string]: any}) {
        this._addr = addr;
        this._mem = Mem.load(addr);
        if (!this._mem.t) {
            this._mem.t = this.type;
            this.memory.i = obj.id;
            this._obj = obj;
            this.init(para);
        } else {
            this.reload();
        }
    }

    get memory(): any {return this._mem.d;}
    get obj(): any {return this._obj;}
    get addr(): any {return this._addr;}

    // Refresh expired object/memory data in the begining of each cycle
    refresh() {
        this._mem = Mem.load(this._addr);
        this._obj = Game.getObjectById(this.memory.i);
    }

    // Initialize memory and class attributes at first instantiation
    abstract init(para: {[name: string]: any});

    // Reload memory and object at global reset
    abstract reload();
    
    // Wrapper function 
    abstract run();
}

export abstract class DataProto {
    readonly type: string = '';
    private _addr: Addr;
    private _mem: MemoryBlock;

    // Game object and parameters must be provided at first instantiation
    constructor(addr: Addr, para?: {[name: string]: any}) {
        this._addr = addr;
        this._mem = Mem.load(addr);
        if (!this._mem.t) {
            this._mem.t = this.type;
            this.init(para);
        } else {
            this.reload();
        }
    }

    get memory(): any {return this._mem.d;}
    get addr(): any {return this._addr;}

    // Refresh expired object/memory data in the begining of each cycle
    refresh() {
        this._mem = Mem.load(this._addr);
    }

    // Initialize memory and class attributes at first instantiation
    abstract init(para: {[name: string]: any});

    // Reload memory and object at global reset
    abstract reload();
    
    // Wrapper function 
    abstract run();
}