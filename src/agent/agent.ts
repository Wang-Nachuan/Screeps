import {ObjectProto} from '../protos'
import {CreepWrapper} from '../creep/creep'

export interface AgentMemory {
    
}

export abstract class Agent extends ObjectProto {

    constructor(isInit: boolean, ref: MemRef) {
        super();

    }

    deref(): any {

    }

    enref(): any {

    }
}