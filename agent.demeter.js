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

    static get memory() { return Memory.agents.demeter; }
    static set memory(newVal) { Memory.agents.demeter = newVal; }

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
            for (var type in pool_room) {
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
        spawn: function (roomName, struct, node) {
            if (struct.store.getFreeCapacity(RESOURCE_ENERGY) && !node.request.includes(REQUEST_ENERGY)) {
                // Propose task
                var fromNode = new Node({ x: 0, y: 0, roomName: roomName }, C.SOURCE, null, true, 'source');
                var task = tasks_worker.harvestEnergy(fromNode, node, struct.store.getCapacity(RESOURCE_ENERGY), REQUEST_ENERGY);
                Demeter.propTask(task, 2);
                // Record that task has been proposed
                node.request.push(REQUEST_ENERGY);
            }
        },
        extension: function (roomName, struct, node) {

        },
        road: function (roomName, struct, node) {

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
                func: function (process, roomName, header) {
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

    /* Project block to the terrain
       Input: terrain object of the room, coordinate of left-up corner, block index, whehter the block is maskable
       Return: block object
    */
    static _projectBlock(terrain, startPos, blockIdx) {
        // Check for validity
        if (startPos[0] < 0 || startPos[1] < 0 || startPos[0] > 47 || startPos[1] > 47) {
            return [null, 0b000000000, 0b000000000];
        }

        // Check terrain
        var mask = 0b111111111;
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                if (terrain.get(startPos[0] + i, startPos[1] + j) == TERRAIN_MASK_WALL) {
                    mask &= 0b111111111011111111 >> (3 * i + j);
                }
            }
        }

        return [
            blockIdx,       // Block index: index of block in this.construct_blocks
            mask,           // Terrain mask: 1 means the terrain is not wall
            0b000000000     // Structure mask: 1 means the construction site has been set
        ];
    }

    /* Executed right after first spawn has been built in a room, set the base of spawn block
       Input: room name
       Return: true if success, false if spawn number is not 1
    */
    static setBase(roomName) {
        var findSpawn = Game.rooms[roomName].find(FIND_MY_SPAWNS);

        if (findSpawn.length != 1) { return false; }

        // Get the spawn and terrain data
        var spawn = findSpawn[0];
        var spawnPos = [spawn.pos.x, spawn.pos.y];
        var terrain = new Room.Terrain(roomName);

        // Find the start position (left-up corner) of spawn block
        var startPos, baseBlock;
        for (var offset of [[0, -1], [-1, -2], [-2, -2]]) {
            startPos = [spawnPos[0] + offset[0], spawnPos[1] + offset[1]];
            baseBlock = this._projectBlock(terrain, startPos, BLOCK_SPAWN);
            if (baseBlock[1] == 0b111111111) {break;}
        }

        // Check validity
        if (baseBlock[1] != 0b111111111) {return false;}

        // Generate block sequence
        this.memory.blockSeq[roomName] = {startPos: startPos, numRing: 1, seq: [baseBlock]};

        return true;
    }

    /* Add a construction block to the construction block sequence in a ring-based order
       Input: room name, index of block, whether the block is maskalble (i.e. structure can be occupyed by wall)
       Return: true is success, false if unable to place the block (impossible for unmaskable block/no place for structure at all)
    */
    static propBlock(roomName, blockIdx, maskable) {
        var startPos = this.memory.blockSeq[roomName].startPos;     // Central position of construction block sequence
        var seq = this.memory.blockSeq[roomName].seq;               // Construction block seqence of the room
        var count_ring = this.memory.blockSeq[roomName].numRing;    // Number of rings that have been examed

        // Exam the existing rings
        for (var i = 1; i < seq.length; i++) {
            if (seq[i][0] == null) {
                // Check terrain mask
                switch (seq[i][1]) {
                    case 0x111111111:
                        seq[i][0] = blockIdx;
                        return true;
                    case 0x000000000:
                        break;
                    default:
                        if (maskable) {
                            seq[i][0] = blockIdx;
                            return true;
                        }
                        break;
                }
            }
        }

        // Start a new ring
        var terrain = new Room.Terrain(roomName);
        var flage_find = false;

        while (!flage_find && count_ring < 50) {
            count_ring += 1;

            // Find the coordinate of blocks in the ring
            // var length_ring = 8 * count_ring - 8;
            var offset_side = 3 * (2 * count_ring - 2);     // Distance between two adjacent corners
            var startPos_ring = [startPos[0] - 3 * count_ring, startPos[1] - 3 * count_ring];
            var startPos_corner = [
                startPos_ring,
                startPos_ring[0], startPos_ring[1] + offset_side,
                startPos_ring[0] + offset_side, startPos_ring[1] + offset_side,
                startPos_ring[0] + offset_side, startPos_ring[1]
            ];
            var step = [[1, 0], [0, 1], [-1, 0], [0, -1]];
            var startPos_block = [];    // Coordinate offset of each block in the ring

            for (var i = 0; i < 4; i++) {
                var start = startPos_corner[i]
                startPos_block.push[start];     // Corner
                for (var j = 1; j <= 2 * count_ring - 3; j++) {
                    startPos_block.push([start[0] + j * step[i][0], start[1] + j * step[i][1]]);    // Edge
                }
            }

            // Loop through the ring (clock-wise)
            for (var pos of startPos_block) {
                var block = this._projectBlock(terrain, pos, null);
                // Check terrain mask
                switch (block[1]) {
                    case 0x111111111:
                        if (!flage_find) {
                            block[0] = blockIdx;
                            flage_find = true;
                        }
                        break;
                    case 0x000000000:
                        break;
                    default:
                        if (!flage_find && maskable) {
                            block[0] = blockIdx;
                            flage_find = true;
                            break;
                        }
                        break;
                }
                seq.push(block);
            }
        }

        seq.numRing = count_ring;
    }

    /* Try to build all proposed blocks in a room, update mask
       Input: room name
       Return: none
    */
    static buildBlock(roomName) {
        var seq = this.memory.blockSeq[roomName].seq;

        for (var block of seq) {
            
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