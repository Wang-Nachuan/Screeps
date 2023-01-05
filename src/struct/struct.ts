import {ObjectProto} from '../protos'

export interface StructureMemory {
    
}

export class StructureWrapper extends ObjectProto {
    id: Id<_HasId>;
    protected _obj: any;

    constructor(isInit: boolean, ref: MemRef) {
        super();

    }

    get obj(): Creep {return this._obj;}
    set obj(val: Creep) {this._obj = val; this._isWritten = true;}
}