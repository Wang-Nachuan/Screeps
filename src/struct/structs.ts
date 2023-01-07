import {StructureWrapper} from "./struct";
import {SpawnWrapper} from "./instance/spawn";

export class Structs {

    static spawn(ref: MemRef, id: Id<_HasId>, type: string): SpawnWrapper {
        return new SpawnWrapper(true, ref, {id: id, type: type});
    }


    static buildStruct(ref: MemRef, type): StructureWrapper{
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