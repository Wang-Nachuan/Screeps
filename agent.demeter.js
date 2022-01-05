/* Name: agent.demeter.js
   Function: 
   - Manage resource harvest & transportation
   - Building structures
   - Predict resource increment
   - Spawning worker creeps
*/

const Plato = require('./plato');
const Node = require('./node');
const Process = require('./process');
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
        for (var room in Memory.nodePool) {
            var pool_room = Memory.nodePool[room];

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
                        func(room, struct, node);
                    }
                }
            }
        }
    }

    static monitor_functions = {
        spawn: function(room, struct, node) {
            if (struct.store.getFreeCapacity(RESOURCE_ENERGY) && (!node.request.includes(REQUEST_ENERGY))) {
                // Propose task
                var fromNode = new Node({x: 0, y: 0, roomName: room}, C.SOURCE, null, true, 'source');
                var task = tasks_worker.harvestEnergy(fromNode, node, struct.store.getCapacity(RESOURCE_ENERGY), REQUEST_ENERGY);
                Demeter.propTask(task, 2);
                // Record that task has been proposed
                node.request.push(REQUEST_ENERGY);
            }
        },
        extension: function(room, struct, node) {

        },
        road: function(room, struct, node) {

        },
    }

    /*-------------------- Processes --------------------*/

    /* Monitor state of each room, propose process if needed
       Input: none
       Return: none
    */
    static monitorProcess() {
        for (var room of Memory.rooms.haveSpawn) {
            if (!Memory.rooms.developing.includes(room)) {
                Memory.rooms.developing.push(room);
                var process = new Process('develop', room);
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
                func: function(process, room, header) {
                    var token = header | 0x0000;
                    process.targetNum['worker'] = 3;
                    process.realNum['worker'] = 0;
                },
                dep: [],
                weight: 0      // Weight of dependence
            },

            /* Index 1: upgrade controller
               Predecessor: none
               Posdecessor: 2
            */
            {
                func: function(process, room, header) {
                    var token = header | 0x0001;
                    for (var i = 0; i < 2; i++) {
                        var fromNode = new Node({x: 0, y: 0, roomName: room}, C.SOURCE, null, true, 'source');
                        var task = tasks_worker.upgradeController(fromNode, room, 2, token);
                        Demeter.propTask(task, 3);
                    }
                },
                dep: [2],
                weight: 2      // Weight of dependence
            },
    
    
            /* Index ?: the end of process, send 'process terminate' message to message queue
               Predecessor: 1
               Posdecessor: none
            */
            {
                func: function(process, room, header) {
                    var token = header | 0x0002;
                    console.log("[Message] Process 'develop' terminated at room", room);
                    // Demeter.sendMsg([token, C.MSG_PROCESS_TERMINATE]);
                },
                dep: [],
                weight: 0
            },
    
            // /* Index n:
            //    Predecessor:
            //    Posdecessor: 
            // */
            // {
            //     func: function(room, header) {
                    
            //     },
            //     dep: [],
            //     weight: 0
            // },
        ],
    };

    /*------------------ Constructions -----------------*/

    /* Executed right after first spawn is built in a room
       Input: none
       Return: none
    */
    static setBase() {

    }

    /* Build a construction block
       Input: index of block in block list
       Return: none
    */
    static buildBlock(blockIdx) {

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