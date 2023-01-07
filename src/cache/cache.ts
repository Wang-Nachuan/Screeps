/**
 * Caching data in global memory
 */

import {CreepWrapper} from "../creep/creep"
import {StructureWrapper} from "../struct/struct";
import {Agent} from "../agent/agent";
import {TaskFlow} from "../task/taskFlow";

export class Cache {
    log: {[key: Id<_HasId>]: any};
    global: {
        struct: StructureTypes;
        agent: {[name: string]: Agent};
        taskFlow: {[name: string]: TaskFlow};
    };
    room: {
        [key: string]: {
            struct: StructureTypes;
            agent: {[name: string]: Agent};
            taskFlow: {[name: string]: TaskFlow};
        };
    };

    constructor() {
        this.log = {};
        this.global = {
            struct: getStructureTypes(),
            agent: {},
            taskFlow: {}
        }
        this.room = {};
        // First initialize objects that have ID
        // Sreeps
        for (let creepName in Game.creeps) {    
            let creep = new CreepWrapper(false, Game.creeps[creepName].id);
            this.log[creep.obj.id] = creep;
        }
        // Global structures
        for (let type in Memory.global.struct) {   
            for (let idx in Memory.global.struct[type]) {
                let struct = new StructureWrapper(false, ['global', 'struct', type, idx]);
                this.global.struct[type].push(struct);
                this.log[struct.obj.id] = struct;
            }
        }
        // Room structures
        for (let roomName in Memory.room) {
            this.room[roomName] = {
                struct: getStructureTypes(),
                agent: {},
                taskFlow: {}
            };
            for (let type in Memory.room[roomName].struct) {
                for (let idx in Memory.room[roomName].struct[type]) {
                    let struct = new StructureWrapper(false, ['room', roomName, 'struct', type, idx]);
                    this.room[roomName].struct[type].push(struct);
                    this.log[struct.obj.id] = struct;
                }
            }
        }
        // Then initialize objects that do not have ID
        // TODO: Global agents
        // TODO: Global taskflows
        // TODO: Room agents
        // TODO: Room taskflows
    }

}

function getStructureTypes() {
    return { 
        spawn: [], extension: [], road: [], constructedWall: [], 
        rampart: [], keeperLair: [], portal: [], controller: [], 
        link: [], storage: [], tower: [], observer: [], powerBank: [], 
        powerSpawn: [], extractor: [], lab: [], terminal: [], 
        container: [], nuker: [], factory: [], invaderCore: []
    };
}

interface CreepTypes {
    worker: Array<CreepWrapper>;
    transporter: Array<CreepWrapper>;
    attacker: Array<CreepWrapper>;
    healer: Array<CreepWrapper>;
}

interface StructureTypes {
    spawn: Array<StructureWrapper>;
    extension: Array<StructureWrapper>;
    road: Array<StructureWrapper>;
    constructedWall: Array<StructureWrapper>;
    rampart: Array<StructureWrapper>;
    keeperLair: Array<StructureWrapper>;
    portal: Array<StructureWrapper>;
    controller: Array<StructureWrapper>;
    link: Array<StructureWrapper>;
    storage: Array<StructureWrapper>;
    tower: Array<StructureWrapper>;
    observer: Array<StructureWrapper>;
    powerBank: Array<StructureWrapper>;
    powerSpawn: Array<StructureWrapper>;
    extractor: Array<StructureWrapper>;
    lab: Array<StructureWrapper>;
    terminal: Array<StructureWrapper>;
    container: Array<StructureWrapper>;
    nuker: Array<StructureWrapper>;
    factory: Array<StructureWrapper>;
    invaderCore: Array<StructureWrapper>;
}
