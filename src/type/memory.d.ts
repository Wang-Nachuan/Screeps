import {AgentMemory} from "../agent/agent";
import {TaskFlowMemory} from "../task/taskFlow";
import {StructureMemory} from "../struct/struct";

declare global {
    interface Memory {
        initFlag: boolean;
        global: GlobalMemory;
        room: {[name: string]: RoomMemory};
    }
}

interface GlobalMemory {
    struct: StructureTypesMemory;
    agent: {[name: string]: AgentMemory};
    taskFlow: {[name: string]: TaskFlowMemory};
}

interface RoomMemory {
    struct: StructureTypesMemory;
    source: Array<SourceMemory>;
    agent: {[name: string]: AgentMemory};
    taskFlow: {
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
    id: Id<_HasId>;
    attach: number;
}







