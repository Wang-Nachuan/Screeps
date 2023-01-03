import {ObjectProto} from '../protos'

export interface StructureMemory {
    
}

export class StructureWrapper extends ObjectProto {
    protected _obj: any;

    constructor(pkg: any) {
        super();

    }

    get obj(): Creep {return this._obj;}
    set obj(val: Creep) {this._obj = val; this._isWritten = true;}
}