/* Name: agent.demeter.js
   Function: 
   - Manage resource harvest & transportation
   - Building structures
   - Predict resource increment
   - Spawning worker creeps
*/

const Plato = require('./plato');
const Node = require('./class.node');
const Process = require('./class.process');
const C = require('./constant');
const tasks_worker = require('./task.worker');

// Structure's request
const REQUEST_ENERGY = 0;
const REQUEST_REPAIRE = 1;

// Index of construction blocks
const BLOCK_SPAWN = 0;
const BLOCK_CENTRAL = 1;
const BLOCK_EXTENSION_TOWER = 2;
const BLOCK_EXTENSION = 3;

class Demeter extends Plato {

    static get memory() {return Memory.agents.demeter;}
    static set memory(newVal) {Memory.agents.demeter = newVal;}

    /* Wrapper function run in the main loop
       Input: none
       Return: none
    */
    static wrapper() {
        this.deliverMsg();
        this.monitorStruct();
        this.monitorProcess();
        this.monitorTargetNum(C.TOKEN_HEADER_DEMETER);
    }

    /* Deliver messages in the message queue
       Input: none
       Return: none
    */
    static deliverMsg() {
        // Call functions to process the message
        var queue = Memory.msgQueue[C.TOKEN_HEADER_DEMETER >>> 12];
        for (var msg of queue) {
            switch (msg[1]) {
                case C.MSG_TASK_TERMINATE:
                    this.promoProcess(msg[0], this.process_functions);
                    break;
                case C.MSG_TASK_HALT:
                    break;
                case C.MSG_PROCESS_TERMINATE:
                    this.endProcess(msg[0]);
                    break;
                case C.MSG_REPORT_EMERGENCY:
                    break
                case C.MSG_CREEP_DEATH:
                    break;
                default:
                    break;
            }
        }
        // Clean message queue
        Memory.msgQueue[C.TOKEN_HEADER_DEMETER >>> 12] = [];
    }

    /*-------------------- Structures --------------------*/

    /* Monitor state of structures in each room, propose tasks if needed
       Input: none
       Return: none
    */
    static monitorStruct() {
        // Loop through all rooms
        for (var roomName in Memory.nodePool) {
            var pool_room = Memory.nodePool[roomName];

            // Loop through all structures
            for(var type in pool_room) {
                var pool_struct = pool_room[type];

                // Loop through each structure
                for (var i in pool_struct) {
                    var node = pool_struct[i];
                    var struct = Game.getObjectById(node.id);

                    // If not find, report the event, delete the node
                    if (struct == null) {
                        this.sendMsg([C.TOKEN_HEADER_PLATO, C.MSG_REPORT_EMERGENCY, {
                                text: '[WARNING] DEMETER: a structure is missing',
                                info: null
                            }
                        ]);
                        pool_struct.splice(i, 1);
                    }

                    // If hits lost, report the event
                    /* TODO */

                    // Call corresponding monitor function
                    var func = this.monitor_functions[node.type];
                    if (func != undefined) {
                        func(roomName, struct, node);
                    }
                }
            }
        }
    }

    static monitor_functions = {
        spawn: function(roomName, struct, node) {
            if (struct.store.getFreeCapacity(RESOURCE_ENERGY) && (!node.request.includes(REQUEST_ENERGY))) {
                // Propose task
                var fromNode = new Node({x: 0, y: 0, roomName: roomName}, C.SOURCE, null, true, 'source');
                var task = tasks_worker.harvestEnergy(fromNode, node, struct.store.getCapacity(RESOURCE_ENERGY), REQUEST_ENERGY);
                Demeter.propTask(task, 2);
                // Record that task has been proposed
                node.request.push(REQUEST_ENERGY);
            }
        },
        extension: function(roomName, struct, node) {

        },
        road: function(roomName, struct, node) {

        },
    }

    /*-------------------- Processes --------------------*/

    /* Monitor state of each room, propose process if needed
       Input: none
       Return: none
    */
    static monitorProcess() {
        for (var roomName of Memory.rooms.haveSpawn) {
            // Develop
            if (!Memory.rooms.developing.includes(roomName)) {
                Memory.rooms.developing.push(roomName);
                var process = new Process('develop', roomName);
                this.propProcess(C.TOKEN_HEADER_DEMETER, process, this.process_functions);
            }
        }
    }

    
    static process_functions = {

        /* Process: develop a room
        */
        'develop': [

            /* Index 0: spawn creeps
               Predecessor: none
               Posdecessor: 
            */
            {
                func: function(process, roomName, header) {
                    var token = header | 0x0000;
                    process.targetNum['worker'] = 3;
                    process.realNum['worker'] = 0;
                },
                dep: [],
                weight: 0      // Weight of dependence
            },

            // /* Index 1: upgrade controller
            //    Predecessor: none
            //    Posdecessor: 2
            // */
            // {
            //     func: function(process, roomName, header) {
            //         var token = header | 0x0001;
            //         for (var i = 0; i < 2; i++) {
            //             var fromNode = new Node({x: 0, y: 0, roomName: roomName}, C.SOURCE, null, true, 'source');
            //             var task = tasks_worker.upgradeController(fromNode, roomName, 2, token);
            //             Demeter.propTask(task, 3);
            //         }
            //     },
            //     dep: [2],
            //     weight: 2      // Weight of dependence
            // },
    
    
            // /* Index ?: the end of process, send 'process terminate' message to message queue
            //    Predecessor: 1
            //    Posdecessor: none
            // */
            // {
            //     func: function(process, roomName, header) {
            //         var token = header | 0x0002;
            //         console.log("[Message] Process 'develop' terminated at room", roomName);
            //         // Demeter.sendMsg([token, C.MSG_PROCESS_TERMINATE]);
            //     },
            //     dep: [],
            //     weight: 0
            // },
    
            // /* Index n:
            //    Predecessor:
            //    Posdecessor: 
            // */
            // {
            //     func: function(roomName, header) {
                    
            //     },
            //     dep: [],
            //     weight: 0
            // },
        ],
    };

    /*------------------ Constructions -----------------*/

    /* Executed right after first spawn has been built in a room, set the base of spawn block
       Input: room name
       Return: true if success, false if spawn number is not 1
    */
    static setBase(roomName) {
        var findSpawn = Game.rooms[roomName].find(FIND_MY_SPAWNS);

        if (findSpawn.length != 1) {return false;}
        
        // Get the spawn and terrain data
        var spawn = findSpawn[0];
        var spawnPos = [spawn.pos.x, spawn.pos.y];
        var terrain = new Room.Terrain(roomName);

        // Find the start position (left-up corner) of spawn block
        var startPos = [null, null];
        for (var offset of [[0, -1], [-1, -2], [-2, -2]]) {
            startPos[0] = spawnPos[0] + offset[0];
            startPos[1] = spawnPos[1] + offset[1];
            // Check for validity
            if (startPos[0] < 0 || startPos[1] < 0 || startPos[0] > 47 || startPos[1] > 47) {continue;}
            // Make sure that no wall within block
            var isValid = true;
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < 3; j++) {
                    if (terrain.get(startPos[0] + i, startPos[1] + j) == TERRAIN_MASK_WALL) {
                        isValid = false;
                        break;
                    }
                }
                if (!isValid) {break;}
            }
            if (!isValid) {
                startPos = [null, null];
            } else {
                break;
            }
        }

        // Check validity
        if (startPos[0] == null) {return false;}

        // Generate block sequence
        var baseBlock = [
            BLOCK_SPAWN,    // Block index: index of block in this.construct_blocks
            0b111111111,    // Terrain mask: 1 means the terrain is not wall
            0b000000000     // Structure mask: 1 means the construction site has been set
        ]; 
        this.memory.blockSeq[roomName] = {startPos: startPos, seq: [baseBlock]};

        return true;
    }

    /* Add a construction block to the block sequence in a ring-based order
       Input: room name, index of block, whether the block is maskalble (i.e. structure can be occupyed by wall)
       Return: true is success, false if unable to place the block (impossible for unmaskable block/no place for structure at all)
    */
    static addBlock(roomName, blockIdx, maskable) {
        var startPos = this.memory.blockSeq[roomName].startPos;
        var seq = this.memory.blockSeq[roomName].seq;
        var count_block = 1;
        var count_ring = 1;
        var flage_find = false;

        // Find the position for new block
        while(!flage_find) {
            count_ring += 1;
            
            // Find left-up corner coordinate of blocks in the ring
            var length_ring = 8 * count_ring - 7;
            var offset_side = 3 * (2 * count_ring - 2);
            var startPos_0 = [startPos[0] - 3 * count_ring, startPos[1] - 3 * count_ring];
            var startPos_1 = [startPos_0[0], startPos_0[1] + offset_side];
            var startPos_2 = [startPos_0[0] + offset_side, startPos_0[1] + offset_side];
            var startPos_3 = [startPos_0[0] + offset_side, startPos_0[1]];

            var corners = [startPos_0, startPos_1, startPos_2, startPos_3];
            var step = [[1, 0], [0, 1], [-1, 0], [0, -1]];
            var offset = [];

            for (var i = 0; i < 4; i++) {
                var start = corners[i]
                offset.push[start];
                for (var j = 1; j <= 2 * count_ring - 3; j++) {
                    offset.push([start[0] + j * step[i][0], start[1] + j * step[i][1]]);
                }
            }

            // Loop through the ring (clock-wise)
            for (var i = 0; i < length_ring; i++) {

            }
        }
    }

    static construct_blocks = [

        // 0: Spawn
        [
            [STRUCTURE_ROAD, STRUCTURE_POWER_SPAWN, STRUCTURE_ROAD], 
            [STRUCTURE_SPAWN, STRUCTURE_ROAD, STRUCTURE_SPAWN], 
            [STRUCTURE_ROAD, STRUCTURE_SPAWN, STRUCTURE_ROAD]
        ],

        // 1: Central processing group
        [
            [STRUCTURE_ROAD, STRUCTURE_FACTORY, STRUCTURE_ROAD], 
            [STRUCTURE_STORAGE, STRUCTURE_ROAD, STRUCTURE_TERMINAL], 
            [STRUCTURE_ROAD, STRUCTURE_LINK, STRUCTURE_ROAD]
        ],

        // 2: Extension and tower
        [
            [STRUCTURE_ROAD, STRUCTURE_TOWER, STRUCTURE_ROAD], 
            [STRUCTURE_EXTENSION, STRUCTURE_ROAD, STRUCTURE_EXTENSION], 
            [STRUCTURE_ROAD, STRUCTURE_EXTENSION, STRUCTURE_ROAD]
        ],

        // 3: Extension
        [
            [STRUCTURE_ROAD, STRUCTURE_EXTENSION, STRUCTURE_ROAD], 
            [STRUCTURE_EXTENSION, STRUCTURE_ROAD, STRUCTURE_EXTENSION], 
            [STRUCTURE_ROAD, STRUCTURE_EXTENSION, STRUCTURE_ROAD]
        ],

        // // i:
        // [
        //     [STRUCTURE_ROAD, , STRUCTURE_ROAD], 
        //     [, STRUCTURE_ROAD, ], 
        //     [STRUCTURE_ROAD, , STRUCTURE_ROAD]
        // ],
    ]
}

module.exports = Demeter;