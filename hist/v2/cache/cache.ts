/**
 * Caching data in global memory
 */

import {CreepWrapper} from "../creep/creep"
import {StructureWrapper} from "../struct/struct";
import {Structs} from "../struct/structs";
import {Agent} from "../agent/agent";
import {Agents} from "../agent/agents";
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
        // All Sreeps
        for (let creepName in Game.creeps) {    
            let creep = Game.creeps[creepName];
            if (creep.memory.r) {
                this.log[creep.id] = new CreepWrapper(false, creep.id);
            }
        }
        // Global structures
        for (let type in Memory.global.struct) {   
            for (let idx in Memory.global.struct[type]) {
                let struct = Structs.buildStruct(['global', 'struct', type, idx], type);
                this.global.struct[type].push(struct);
                this.log[struct.obj.id] = struct;
            }
        }
        // Global agents
        for (let name in Memory.global.agent) {
            this.global.agent[name] = Agents.buildAgent(['global', 'agent', name], name);
        }
        // Global taskflows
        for (let name in Memory.global.taskFlow) {
            this.global.taskFlow[name] = new TaskFlow(false, ['global', 'taskFlow', name]);
        }
        for (let roomName in Memory.room) {
            this.room[roomName] = {
                struct: getStructureTypes(),
                agent: {},
                taskFlow: {}
            };
            // Room structures
            for (let type in Memory.room[roomName].struct) {
                for (let idx in Memory.room[roomName].struct[type]) {
                    let struct = Structs.buildStruct(['room', roomName, 'struct', type, idx], type);
                    this.room[roomName].struct[type].push(struct);
                    this.log[struct.obj.id] = struct;
                }
            }
            // Room sources (TODO: need a wrapper)
            // for (let source of Memory.room[roomName].source) {
            //     this.room[roomName].source.push(Game.getObjectById(source.id))
            // }
            // Room agents
            for (let name in Memory.room[roomName].agent) {
                this.room[roomName].agent[name] = Agents.buildAgent(['room', roomName, 'agent', name], name);
            }
            // Room taskflows
            for (let name in Memory.room[roomName].taskFlow) {
                this.room[roomName].taskFlow[name] = new TaskFlow(false, ['room', roomName, 'taskFlow', name]);
            }
        }
    }

    exe() {
        for (let name in this.global.agent) {
            this.global.agent[name].exe();
        }
        for (let type in this.global.struct) {
            for (let struct of this.global.struct[type]) {
                struct.exe();
            }
        }
        for (let type in this.global.taskFlow) {
            this.global.taskFlow[type].exe();
        }
        for (let roomName in this.room) {
            let room = this.room[roomName];
            for (let name in room.agent) {
                room.agent[name].exe();
            }
            for (let type in room.struct) {
                for (let struct of room.struct[type]) {
                    struct.exe();
                }
            }
            for (let type in room.taskFlow) {
                room.taskFlow[type].exe();
            }
        }
    }

    writeBack() {
        for (let name in this.global.agent) {
            this.global.agent[name].wb();
        }
        for (let type in this.global.struct) {
            for (let struct of this.global.struct[type]) {
                struct.wb();
            }
        }
        for (let type in this.global.taskFlow) {
            this.global.taskFlow[type].wb();
        }
        for (let roomName in this.room) {
            let room = this.room[roomName];
            for (let name in room.agent) {
                room.agent[name].wb();
            }
            for (let type in room.struct) {
                for (let struct of room.struct[type]) {
                    struct.wb();
                }
            }
            for (let type in room.taskFlow) {
                room.taskFlow[type].wb();
            }
        }
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
