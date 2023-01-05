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
        structs: StructureTypes;
        agents: {[name: string]: Agent};
        taskFlows: {[name: string]: TaskFlow};
    };
    rooms: {
        [key: string]: {
            structs: StructureTypes;
            agents: {[name: string]: Agent};
            taskFlows: {[name: string]: TaskFlow};
        };
    };

    constructor() {
        this.log = {};
        this.global = {
            structs: getStructureTypes(),
            agents: {},
            taskFlows: {}
        }
        this.rooms = {};
        // First initialize objects that have ID
        // Sreeps
        for (let creepName in Game.creeps) {    
            let creep = new CreepWrapper(false, Game.creeps[creepName].id);
            this.log[creep.obj.id] = creep;
        }
        // Global structures
        for (let type in Memory.global.structs) {   
            for (let idx in Memory.global.structs[type]) {
                let struct = new StructureWrapper(false, ['global', 'structs', type, idx]);
                this.global.structs[type].push(struct);
                this.log[struct.obj.id] = struct;
            }
        }
        // Room structures
        for (let roomName in Memory.rooms) {
            this.rooms[roomName] = {
                structs: getStructureTypes(),
                agents: {},
                taskFlows: {}
            };
            for (let type in Memory.rooms[roomName].structs) {
                for (let idx in Memory.rooms[roomName].structs[type]) {
                    let struct = new StructureWrapper(false, ['rooms', roomName, 'structs', type, idx]);
                    this.rooms[roomName].structs[type].push(struct);
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
