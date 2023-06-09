import {StructureWrapper} from "./struct";
import {SpawnWrapper} from "./instance/spawn";

export class Structs {

    static createStruct(ref: MemRef, obj: any): StructureWrapper {
        let id = obj.id;
        let type = obj.structureType;
        switch (type) {
            case STRUCTURE_SPAWN: {
                return new SpawnWrapper(true, ref, {id: id});
            }
            default: {
                return new StructureWrapper(true, ref, {id: id});
            }
        }
    }

    static buildStruct(ref: MemRef, type: string): StructureWrapper{
        switch (type) {
            case STRUCTURE_SPAWN: {
                return new SpawnWrapper(false, ref);
            }
            default: {
                return new StructureWrapper(false, ref);
            }
        }
    }
}