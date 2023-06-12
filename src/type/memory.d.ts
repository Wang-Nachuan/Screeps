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
    struct: RoomStructureMemory;
    process: {[name: string]: ProcessMemory};
}

interface RoomMemory {
    struct: RoomStructureMemory;
    source: {[id: string]: {attach: number;}};
    taskQueue: any;
    spawnQueue: any;
    process: {[name: string]: ProcessMemory};
}

interface CreepMemory {
    id: string;
    role: string;
    owned: boolean;             // True if the creep is owned by a process
    prio: number;               // Priority of the process that owns the creep
    task: TaskMemory | null;    // Task that the creep is executing
}

interface RoomCreepMemory {
    harvester: {[id: string]: CreepMemory};
    worker: {[id: string]: CreepMemory};
    transporter: {[id: string]: CreepMemory};
    attacker: {[id: string]: CreepMemory};
    healer: {[id: string]: CreepMemory};
}

interface StructureMemory {
    taskLog: TaskLog;
}

interface RoomStructureMemory {
    spawn: {[id: string]: StructureMemory};
    extension: {[id: string]: StructureMemory};
    road: {[id: string]: StructureMemory};
    constructedWall: {[id: string]: StructureMemory};
    rampart: {[id: string]: StructureMemory};
    keeperLair: {[id: string]: StructureMemory};
    portal: {[id: string]: StructureMemory};
    controller: {[id: string]: StructureMemory};
    link: {[id: string]: StructureMemory};
    storage: {[id: string]: StructureMemory};
    tower: {[id: string]: StructureMemory};
    observer: {[id: string]: StructureMemory};
    powerBank: {[id: string]: StructureMemory};
    powerSpawn: {[id: string]: StructureMemory};
    extractor: {[id: string]: StructureMemory};
    lab: {[id: string]: StructureMemory};
    terminal: {[id: string]: StructureMemory};
    container: {[id: string]: StructureMemory};
    nuker: {[id: string]: StructureMemory};
    factory: {[id: string]: StructureMemory};
    invaderCore: {[id: string]: StructureMemory};
}