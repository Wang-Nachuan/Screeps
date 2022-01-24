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
const BLOCK_CENTRER = 0;
const BLOCK_EXTENSION = 1;
const BLOCK_LAB = 2;
const BLOCK_PSE_MASKABLE = 3;
const BLOCK_PSE_UNMASKABLE = 4;
const BLOCK_PSE_WALL = 5;

const BLOCK_SIZE = 4;

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
                var fromNode = new Node({x: 0, y: 0, roomName: roomName }, C.SOURCE, null, true, 'source');
                var task = tasks_worker.harvestEnergy(fromNode, node, struct.store.getCapacity(RESOURCE_ENERGY), REQUEST_ENERGY);
                Demeter.propTask(task, C.PRIO_HARVEST_ENERGY);
                // Record that task has been proposed
                node.request.push(REQUEST_ENERGY);
            }
        },
        extension: function (roomName, struct, node) {
            if (struct.store.getFreeCapacity(RESOURCE_ENERGY) && !node.request.includes(REQUEST_ENERGY)) {
                // Propose task
                var fromNode = new Node({x: 0, y: 0, roomName: roomName}, C.SOURCE, null, true, 'source');
                var task = tasks_worker.harvestEnergy(fromNode, node, struct.store.getCapacity(RESOURCE_ENERGY), REQUEST_ENERGY);
                Demeter.propTask(task, C.PRIO_HARVEST_ENERGY);
                // Record that task has been proposed
                node.request.push(REQUEST_ENERGY);
            }
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

            /* Index 0: RCL 1->2
               Predecessor: none
               Posdecessor: 1
            */
            {
                func: function (process, roomName, header) {
                    var token = header | 0x0000;
                    // Spawn workers
                    Process.setTarget(process, 'worker', 8);
                    // Set base and lab block
                    if (!Demeter.setBase(roomName)) {
                        console.log(`[ERROR] Demeter/room: '${roomName}'/process: 'develop'/stage: 'RCL 1->2'/cannot set base`);
                    }
                    Demeter.propBlock(roomName, BLOCK_LAB, false);
                    // Propose tasks
                    for (var i = 0; i < 2; i++) {
                        var fromNode = new Node({x: 0, y: 0, roomName: roomName}, C.SOURCE, null, true, 'source');
                        var task = tasks_worker.upgradeController(fromNode, roomName, 2, token);
                        Demeter.propTask(task, C.PRIO_UPGRADE);
                    }
                    // Print message
                    console.log(`[MESSAGE] Demeter/room: '${roomName}'/process: 'develop'/stage: 'RCL 1->2'/scheduled`);
                },
                dep: [1],
                weight: 1
            },

            /* Index 1: RCL 2->3
               Predecessor: 0
               Posdecessor: 2
            */
            {
                func: function(process, roomName, header) {
                    var token = header | 0x0001;
                    // Set extension block
                    Demeter.propBlock(roomName, BLOCK_EXTENSION, false);
                    // Build block
                    Demeter.buildBlock(roomName, [STRUCTURE_ROAD, STRUCTURE_LAB, STRUCTURE_SPAWN, STRUCTURE_POWER_SPAWN, STRUCTURE_LINK, STRUCTURE_STORAGE, STRUCTURE_TERMINAL, STRUCTURE_FACTORY]);
                    console.log(`[MESSAGE] Demeter/room: '${roomName}'/process: 'develop'/stage: 'RCL 2->3'/scheduled`);
                },
                dep: [],
                weight: 0
            },

            // /* Index n:
            //    Predecessor:
            //    Posdecessor: 
            // */
            // {
            //     func: function(process, roomName, header) {
            
            //     },
            //     dep: [],    // Index of stages that depends on this stage
            //     weight: 0   // Weight of dependence
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
        if (startPos[0] < 0 || startPos[1] < 0 || startPos[0] > 46 || startPos[1] > 46) {
            return [null, 0x0000, 0x00000];
        }

        // Check terrain
        var mask = 0xffff;
        for (var y = 0; y < BLOCK_SIZE; y++) {
            for (var x = 0; x < BLOCK_SIZE; x++) {
                if (terrain.get(startPos[0] + x, startPos[1] + y) == TERRAIN_MASK_WALL) {
                    mask &= 0xffff7fff >> (x + BLOCK_SIZE * y);
                }
            }
        }

        return [
            startPos,   // Start position: coordinate of left-up corner of block
            blockIdx,   // Block index: index of block in this.construct_blocks
            mask,       // Terrain mask: 1 means the terrain is not wall
            0x0000      // Structure mask: 1 means the construction site has been set
        ];
    }

    /* Executed right after first spawn has been built in a room, set the base of spawn block
       Input: room name
       Return: true if success, false if spawn number is not 1/there is wall with block
    */
    static setBase(roomName) {
        var findSpawn = Game.rooms[roomName].find(FIND_MY_SPAWNS);

        if (findSpawn.length != 1) {return false;}

        // Get the spawn and terrain data
        var spawn = findSpawn[0];
        var spawnPos = [spawn.pos.x, spawn.pos.y];
        var terrain = new Room.Terrain(roomName);

        // Find the start position (left-up corner) of spawn block
        var startPos, baseBlock;
        for (var offset of [[0, -1], [0, -2], [-1, -3]]) {
            startPos = [spawnPos[0] + offset[0], spawnPos[1] + offset[1]];
            baseBlock = this._projectBlock(terrain, startPos, BLOCK_CENTRER);
            if (baseBlock[2] == 0xffff) {break;}
        }

        // Check validity
        if (baseBlock[2] != 0xffff) {return false;}

        // Generate block sequence
        this.memory.blockSeq[roomName] = {cursor: 0, seq: [baseBlock]};

        return true;
    }

    /* Add a construction block to the construction block sequence in a ring-based order
       Input: room name, index of block, whether the block is maskalble (i.e. structure can be occupyed by wall)
       Return: true if success
    */
    static propBlock(roomName, blockIdx, maskable) {
        var seq = this.memory.blockSeq[roomName].seq;
        var cursor = this.memory.blockSeq[roomName].cursor;
        var terrain = new Room.Terrain(roomName);
        var find_flage = false;
        var leaf;   // The block to find
        
        // First search within existing presudo blocks
        for (var i of seq) {
            if ((i[1] == BLOCK_PSE_MASKABLE && maskable) || (i[1] == BLOCK_PSE_UNMASKABLE && !maskable)) {
                i[1] = blockIdx;
                return true;
            }
        }

        // Find a right position for new block
        while (!find_flage) {
            var root = seq[cursor];

            // Search in four direction
            for (var offset of [[BLOCK_SIZE, 0], [0, BLOCK_SIZE], [-BLOCK_SIZE, 0], [0, -BLOCK_SIZE]]) {
                var startPos = [root[0][0] + offset[0], root[0][1] + offset[1]];

                // Check for repetition
                var repe_flage = false;
                for (var i of seq) {
                    if (i[0][0] == startPos[0] && i[0][1] == startPos[1]) {
                        repe_flage = true;
                        break;
                    }
                }
                if (repe_flage) {continue;}

                // Project block to the terrain
                leaf = this._projectBlock(terrain, startPos, blockIdx);

                // Check for validity
                switch (leaf[2]) {
                    case 0x0000:    // All wall
                        leaf[1] = BLOCK_PSE_WALL;
                        break;
                    case 0xffff:    // All plain
                        if (!find_flage) {
                            find_flage = true;
                        } else {
                            leaf[1] = BLOCK_PSE_UNMASKABLE;
                        }
                        break;
                    default:        // Partially plain
                        if (maskable && !find_flage) {
                            find_flage = true;
                        } else {
                            leaf[1] = BLOCK_PSE_MASKABLE;
                        }
                        break;
                }
                
                seq.push(leaf);
            }

            cursor += 1;
        }

        return true;
    }

    /* Try to build all proposed blocks in a room, update mask
       Input: room name, list of structure types to ignore
       Return: none
    */
    static buildBlock(roomName, ignore) {
        var seq = this.memory.blockSeq[roomName].seq;

        for (var block of seq) {
            var structMask = block[3];
            var unbuilt = block[2] ^ structMask;    // If terrainMask[i] != structMask[i], a structure is unbuilt

            if (block[1] == BLOCK_PSE_MASKABLE || block[1] == BLOCK_PSE_UNMASKABLE || block[1] == BLOCK_PSE_WALL) {continue;}

            // Block that has unbuilt structure
            if (unbuilt != 0) {
                for (var y = 0; y < BLOCK_SIZE; y++) {
                    for (var x = 0; x < BLOCK_SIZE; x++) {
                        var mask = 0x8000 >>> (x + y * BLOCK_SIZE);
                        if (unbuilt & mask == 0) {continue;}
                        var type = this.construct_blocks[block[1]][y][x];
                        if (ignore.includes(type)) {continue;}
                        var pos = new RoomPosition(block[0][0] + x, block[0][1] + y, roomName);
                        if (OK != pos.createConstructionSite(type)) {continue;}
                        structMask |= mask;
                    }
                }
            }

            // Update structure mask
            block[3] = structMask;
        }
    }

    static construct_blocks = [

        // 0: Central group
        [
            [STRUCTURE_ROAD, STRUCTURE_LINK, STRUCTURE_STORAGE, STRUCTURE_ROAD],
            [STRUCTURE_SPAWN, STRUCTURE_ROAD, STRUCTURE_ROAD, STRUCTURE_TERMINAL],
            [STRUCTURE_SPAWN, STRUCTURE_ROAD, STRUCTURE_ROAD, STRUCTURE_FACTORY],
            [STRUCTURE_ROAD, STRUCTURE_SPAWN, STRUCTURE_POWER_SPAWN, STRUCTURE_ROAD]
        ],

        // 1: Extension
        [
            [STRUCTURE_ROAD, STRUCTURE_EXTENSION, STRUCTURE_EXTENSION, STRUCTURE_ROAD],
            [STRUCTURE_EXTENSION, STRUCTURE_ROAD, STRUCTURE_ROAD, STRUCTURE_EXTENSION],
            [STRUCTURE_EXTENSION, STRUCTURE_ROAD, STRUCTURE_ROAD, STRUCTURE_EXTENSION],
            [STRUCTURE_ROAD, STRUCTURE_EXTENSION, STRUCTURE_EXTENSION, STRUCTURE_ROAD]
        ],

        // 2: Lab
        [
            [STRUCTURE_ROAD, STRUCTURE_LAB, STRUCTURE_LAB, STRUCTURE_ROAD],
            [STRUCTURE_LAB, STRUCTURE_ROAD, STRUCTURE_LAB, STRUCTURE_LAB],
            [STRUCTURE_LAB, STRUCTURE_LAB, STRUCTURE_ROAD, STRUCTURE_LAB],
            [STRUCTURE_ROAD, STRUCTURE_LAB, STRUCTURE_LAB, STRUCTURE_ROAD]
        ],



        // // i:
        // [
        //     [STRUCTURE_ROAD, , , STRUCTURE_ROAD],
        //     [, STRUCTURE_ROAD, STRUCTURE_ROAD, ],
        //     [, STRUCTURE_ROAD, STRUCTURE_ROAD, ],
        //     [STRUCTURE_ROAD, , , STRUCTURE_ROAD]
        // ],
    ]
}

module.exports = Demeter;