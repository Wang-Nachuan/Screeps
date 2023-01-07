import {TaskFlowMemory} from "../task/taskFlow";
import {CreepMemory} from "../creep/creep";
import {StructureMemory} from "../struct/struct";
import {AgentMemory} from "../agent/agent";

interface Memory {
    initFlag: boolean;
    global: GlobalMemory;
    rooms: {[name: string]: RoomMemory};
}

interface GlobalMemory {
    structs: StructureTypesMemory;
    agents: {[name: string]: AgentMemory};
    taskFlows: {[name: string]: TaskFlowMemory};
}

interface RoomMemory {
    structs: StructureTypesMemory;
    source: Array<SourceMemory>;
    agents: {[name: string]: AgentMemory};
    taskFlows: {
        harvester: TaskFlowMemory;
        worker: TaskFlowMemory;
        transporter: TaskFlowMemory;
        attacker: TaskFlowMemory;
        healer: TaskFlowMemory;
        [name: string]: TaskFlowMemory;
    };
    data: {
        nameIdx: {
            harvester: Array<number>;
            worker: Array<number>;
            transporter: Array<number>;
            attacker: Array<number>;
            healer: Array<number>;
        }
    };
}

// interface CreepTypesMemory {
//     worker: Array<Id<_HasId>>;
//     transporter: Array<Id<_HasId>>;
//     attacker: Array<Id<_HasId>>;
//     healer: Array<Id<_HasId>>;
// }

interface StructureTypesMemory {
    spawn: Array<StructureMemory>;
    extension: Array<StructureMemory>;
    road: Array<StructureMemory>;
    constructedWall: Array<StructureMemory>;
    rampart: Array<StructureMemory>;
    keeperLair: Array<StructureMemory>;
    portal: Array<StructureMemory>;
    controller: Array<StructureMemory>;
    link: Array<StructureMemory>;
    storage: Array<StructureMemory>;
    tower: Array<StructureMemory>;
    observer: Array<StructureMemory>;
    powerBank: Array<StructureMemory>;
    powerSpawn: Array<StructureMemory>;
    extractor: Array<StructureMemory>;
    lab: Array<StructureMemory>;
    terminal: Array<StructureMemory>;
    container: Array<StructureMemory>;
    nuker: Array<StructureMemory>;
    factory: Array<StructureMemory>;
    invaderCore: Array<StructureMemory>;
}

interface SourceMemory {
    
}