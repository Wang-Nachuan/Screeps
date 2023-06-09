// import {GlobalMemory, RoomMemory} from "../type/memory";
// import {Structs} from "../struct/structs";
// import {StructureMemory} from "../struct/struct";
// import {Agents} from "../agent/agents";
// import {TaskFlow} from "@/task/taskFlow";

export class Mem {

    static init() {
        Memory.initFlag = true;
        Memory.global = {};
        Memory.room = {};
        delete Memory.creeps;
        delete Memory.spawns;
        delete Memory.rooms;
        delete Memory.flags;
    }

    static allocate(roomName: string | null): Addr {
        function getUniqeId(table: any): number {
            while (true) {
                let id = Math.floor(Math.random() * 0x8000 + 1);
                if (!table[id]) {
                    table[id] = {t: null, d: {}};
                    return id;
                }
            }
        }
        let addr = {id: null, room: roomName};
        if (roomName) {
            if (!Memory.room[roomName]) {
                Memory.room[roomName] = {};
            }
            addr.id = getUniqeId(Memory.room[roomName]);
            return addr.id;
        } else {
            addr.id = getUniqeId(Memory.global);
            return addr.id;
        }
    }

    static deallocate(addr: Addr) {
        if (addr.room) {
            if (!Memory.room[addr.room][addr.id]) {
                console.log("[ERROR] Function 'deallocate()': Memory object doesn't exist");
            } else {
                delete Memory.room[addr.room][addr.id];
            }
        } else {
            if (!Memory.global[addr.id]) {
                console.log("[ERROR] Function 'deallocate()': Memory object doesn't exist");
            } else {
                delete Memory.global[addr.id];
            } 
        }
    }

    static load(addr: Addr) {
        if (addr.room) {
            return Memory.room[addr.room][addr.id];
        } else {
            return Memory.global[addr.id];
        }
    }

    // static MemInit() {
    //     Memory.initFlag = true;
    //     Memory.global = {
    //         struct: {
    //             spawn: [], extension: [], road: [], constructedWall: [],
    //             rampart: [], keeperLair: [], portal: [], controller: [],
    //             link: [], storage: [], tower: [], observer: [], powerBank: [],
    //             powerSpawn: [], extractor: [], lab: [], terminal: [],
    //             container: [], nuker: [], factory: [], invaderCore: []
    //         },
    //         agent: {},
    //         taskFlow: {}
    //     };
    //     delete Memory.creeps;
    //     delete Memory.spawns;
    //     delete Memory.rooms;
    //     delete Memory.flags;
    //     Memory.room = {};
    //     for (let roomName in Game.rooms) {
    //         this.RoomMemInit(roomName, true);
    //     }
    // }

    // static RoomMemInit(roomName: string, isColonyCenter: boolean) {
    //     Memory.room[roomName] = {
    //         struct: {
    //             spawn: [], extension: [], road: [], constructedWall: [],
    //             rampart: [], keeperLair: [], portal: [], controller: [],
    //             link: [], storage: [], tower: [], observer: [], powerBank: [],
    //             powerSpawn: [], extractor: [], lab: [], terminal: [],
    //             container: [], nuker: [], factory: [], invaderCore: []
    //         },
    //         source: [],
    //         agent: {},
    //         taskFlow: {
    //             harvester: {r: [], q: []},
    //             worker: {r: [], q: []},
    //             transporter: {r: [], q: []},
    //             attacker: {r: [], q: []},
    //             healer: {r: [], q: []}
    //         },
    //         data: {
    //             nameIdx: {
    //                 harvester: [],
    //                 worker: [],
    //                 transporter: [],
    //                 attacker: [],
    //                 healer: []
    //             }
    //         }
    //     }
    //     let roomMem = Memory.room[roomName];
    //     let room = Game.rooms[roomName];
    //     // Structures
    //     for (let struct of room.find(FIND_MY_STRUCTURES)) {
    //         roomMem.struct[struct.structureType].push(<StructureMemory>{});
    //         Structs.createStruct(['room', roomName, 'struct', struct.structureType, roomMem.struct[struct.structureType].length-1], struct);
    //     }
    //     // Sources
    //     for (let source of room.find(FIND_SOURCES)) {
    //         roomMem.source.push({id: source.id, attach: 0});
    //     }
    //     // Agents
    //     if (isColonyCenter) {
    //         roomMem.agent['praetor'] = {t: null, r: null, tl: null, s: null, d: {}};
    //         Agents.praetor(['room', roomName, 'agent', 'praetor'], roomName);
    //         new TaskFlow(true, ['room', roomName, 'taskFlow', 'harvester']);
    //         new TaskFlow(true, ['room', roomName, 'taskFlow', 'worker']);
    //         new TaskFlow(true, ['room', roomName, 'taskFlow', 'transporter']);
    //         new TaskFlow(true, ['room', roomName, 'taskFlow', 'attacker']);
    //         new TaskFlow(true, ['room', roomName, 'taskFlow', 'healer']);
    //     }
    // }

}