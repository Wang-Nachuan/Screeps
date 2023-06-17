/**
 *  Memory hierarchy
 */

import { ProcessMemory } from "@/processe/process";
import { TaskMemory, TaskLog } from "@/task/task";

declare global {
    interface Memory {
        initFlag: boolean;
        global: GlobalMemory;
        room: {[roomName: string]: RoomMemory};
    }
}

interface GlobalMemory {
    creep: CreepsMemory;
    struct: StructuresMemory;
    proc: {[name: string]: ProcessMemory};
}

interface RoomMemory {
    creep: CreepsMemory;
    struct: StructuresMemory;
    src: {id: string; attach: number;}[];
    srcDrop: {};        // TODO
    task: {
        trans: any;
        build: any;
        spawn: any;
    };
    proc: {[name: string]: ProcessMemory};
}

interface CreepsMemory {
    harvester: CreepMemory[];
    worker: CreepMemory[];
    transporter: CreepMemory[];
    upgrader: CreepMemory[];
}

// Should have different interface for different creeps
interface CreepMemory {
    id: string;
    owner: number;      // 0-2 (same as priority) if owned by a process/thread, -1 if not
    state: number;      // Working state
    pkg?: any;          // TODO
}

interface StructuresMemory {
    spawn: {id: string}[];
    extension: {id: string}[];
    road: {id: string}[];
    constructedWall: {id: string}[];
    rampart: {id: string}[];
    keeperLair: {id: string}[];
    portal: {id: string}[];
    controller: {id: string}[];
    link: {id: string}[];
    storage: {id: string}[];
    tower: {id: string}[];
    observer: {id: string}[];
    powerBank: {id: string}[];
    powerSpawn: {id: string}[];
    extractor: {id: string}[];
    lab: {id: string}[];
    terminal: {id: string}[];
    container: {id: string}[];
    nuker: {id: string}[];
    factory: {id: string}[];
    invaderCore: {id: string}[];
}

interface StructureMemory {
    id: string;

}