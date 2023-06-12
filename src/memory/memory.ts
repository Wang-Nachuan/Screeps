/**
 *  Memory related functions
 */

export const Mem = {
    init: function(): void {
        Memory.initFlag = true;
        Memory.global = {
            struct: {
                spawn: [], extension: [], road: [], constructedWall: [],
                rampart: [], keeperLair: [], portal: [], controller: [],
                link: [], storage: [], tower: [], observer: [], powerBank: [],
                powerSpawn: [], extractor: [], lab: [], terminal: [],
                container: [], nuker: [], factory: [], invaderCore: []
            },
            process: {}
        };
        Memory.rooms = {};
        delete Memory.creeps;
        delete Memory.spawns;
        delete Memory.rooms;
        delete Memory.flags;
    },
    initRoom: function(roomName: string): void {
        Memory.rooms[roomName] = {
            struct: {
                spawn: [], extension: [], road: [], constructedWall: [],
                rampart: [], keeperLair: [], portal: [], controller: [],
                link: [], storage: [], tower: [], observer: [], powerBank: [],
                powerSpawn: [], extractor: [], lab: [], terminal: [],
                container: [], nuker: [], factory: [], invaderCore: []
            },
            source: [],
            taskQueue: null,    // TODO
            spawnQueue: null,   // TODO
            process: {}
        }
    }
    // TODO
}