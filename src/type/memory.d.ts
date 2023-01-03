import {TaskFlowMemory} from "../task/taskFlow";
import {CreepMemory} from "../creep/creep";

interface Memory {
    initFlag: boolean;
    global: GlobalMemory;
    creeps: {[id: Id<_HasId>]: CreepMemory};
    rooms: {[name: string]: RoomMemory};
    flags: {[name: string]: FlagMemory};
}

interface GlobalMemory {
    flags: {[name: string]: number};
    taskFlow: TaskFlowMemory[];
}

interface RoomMemory {
    
}

interface FlagMemory {
    
}