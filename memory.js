/* Name: memory.js
   Function: initialize memory
*/

const Node = require('./node');
const C = require('./constant');

module.exports = function () {
    if (!Memory.initFlag) {
        Memory.initFlag = 1;

        /*-------------------- Queues --------------------*/

        // Proposed tasks queue
        Memory.propTaskQueue = {
            soldier: Array(C.MEMORY_TASKQUEUE_LEN),
            worker: Array(C.MEMORY_TASKQUEUE_LEN)
        };

        // Task queue
        Memory.taskQueue = {
            soldier: Array(C.MEMORY_TASKQUEUE_LEN),
            worker: Array(C.MEMORY_TASKQUEUE_LEN)
        };

        // Spawn request queue
        Memory.spawnQueue = {
            prop: Array(C.MEMORY_SPAWNQUEUE_LEN),   // Proposed
            sche: Array(C.MEMORY_SPAWNQUEUE_LEN)    // Scheduled
        }

        // Construction request queue
        Memory.constructQueue = {
            prop: [],   // Proposed
            sche: [],   // Scheduled
            numTask: {}     // RoomName: number
        }
        
        /*-------------------- Pools ---------------------*/

        // Creep pool
        Memory.creepPool = {soldier: [], worker: []};

        // Node pool
        Memory.nodePool = {};

        // Name of owned rooms
        Memory.rooms = {visibable: [], owned: [], haveSpawn: [], developing: []};

        /*-------------------- Others ---------------------*/

        // Statistics
        Memory.statistics = {
            structure: {spawn: 1},
            creep: {worker: 0, soldier: 0},
            energy: {},     // roomName: {available: 0, pinned: 0}
            stdBody: {}     // roomName: {worker: [...], countWorker: {...}, soldier: [...], countSoldier: {...}, ...}
        };

        // Memory space for agents
        Memory.agents = {
            demeter: {},
            hephaestus: {},
            minerva: {}
        };

        /*------------------- Demeter --------------------*/

        // Messaage queue
        Memory.agents.demeter.msgQueue = [];

        // Process queue
        Memory.agents.demeter.proQueue = [];

        Memory.agents.demeter.statistics = {
            proNum: 0,
            attachLimit: 3,
        }

        /*--------------- Initialization -----------------*/

        // Init queues
        for (var i in Memory.taskQueue) {
            for (var j = 0; j < C.MEMORY_TASKQUEUE_LEN; j++) {
                Memory.taskQueue[i][j] = [];
                Memory.propTaskQueue[i][j] = [];
            }
        }

        for (var i = 0; i < C.MEMORY_SPAWNQUEUE_LEN; i++) {
            Memory.spawnQueue.prop[i] = [];
            Memory.spawnQueue.sche[i] = [];
        }

        for (var name in Game.rooms) {
            // Room
            Memory.rooms.visibable.push(name);
            Memory.rooms.owned.push(name);
            Memory.rooms.haveSpawn.push(name);
            // Statistics
            Memory.statistics.energy[name] = {available: 300, pinned: 0};
            Memory.statistics.stdBody[name] = {
                worker: [WORK, CARRY, CARRY, MOVE, MOVE], 
                countWorker: {move: 2, work: 1, carry: 2, attack: 0, rangedAttack: 0, heal: 0, claim: 0, tough: 0}, 
                soldier: [], 
                countSoldier: {move: 0, work: 0, carry: 0, attack: 0, rangedAttack: 0, heal: 0, claim: 0, tough: 0}
            };
            // Node pool
            var room = Game.rooms[name];
            var para = [FIND_MY_SPAWNS, FIND_SOURCES, FIND_MINERALS];
            var type = [STRUCTURE_SPAWN, C.SOURCE, C.MINERAL];
            Memory.nodePool[name] = {
                // Structure
                spawn: [], 
                extension: [], 
                road: [],
                constructedWall: [],
                rampart: [],
                keeperLair: [],
                portal: [],
                controller: [],
                link: [],
                storage: [],
                tower: [],
                observer: [],
                powerBank: [],
                powerSpawn: [],
                extractor: [],
                lab: [],
                terminal: [],
                container: [],
                nuker: [],
                factory: [],
                invaderCore: [],
                // Others
                source: [], 
                mineral: []
            };
            for (var i = 0; i < para.length; i++) {
                var ret = room.find(para[i]);
                for (var obj of ret) {
                    Memory.nodePool[name][type[i]].push(new Node(obj.pos, type[i], obj.id));
                }
            }
            Memory.nodePool[name].controller.push(new Node(room.controller.pos, 'controller', room.controller.id));
        }
    }
};

