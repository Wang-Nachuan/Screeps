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

// Local constants
const REQUEST_ENERGY = 0;
const REQUEST_REPAIRE = 1;

class Demeter extends Plato {

    static get memory() {return Memory.agents.demeter;}
    static set memory(newVal) {Memory.agents.demeter = newVal;}

    /* Wrapper function run in the main loop
       Input: none
       Return: none
    */
    static wrapper() {
        this.deliverMsg();
        this.startProcess();
        this.monitorStruct();
    }

    /* Deliver messages in the message queue
       Input: none
       Return: none
    */
    static deliverMsg() {
        // Call functions to process the message
        for (var msg of this.memory.msgQueue) {
            switch (msg[1]) {
                case C.MSG_TASK_TERMINATE:
                    this.promoProcess(msg);
                    break;
                case C.MSG_SPAWN_TERMINATE:
                    this.promoProcess(msg);
                    break;
                case C.MSG_PROCESS_TERMINATE:
                    Process.end(this.memory.proQueue, msg[0]);
                    this.memory.statistics.proNum -= 1;
                    break;
                default:
                    break;
            }
        }
        // Reset message queue
        this.memory.msgQueue = [];
    }

    /* Loop through all rooms, start process for eligible rooms
       Input: none
       Return: none
    */
    static startProcess() {
        for (var room of Memory.rooms.haveSpawn) {
            if (!Memory.rooms.developing.includes(room)) {
                if (this.memory.statistics.proNum <= 16) {
                    this.memory.statistics.proNum += 1;
                    Memory.rooms.developing.push(room);
                    var pro = new Process(C.TOKEN_HEADER_DEMETER, 'develop', room, [0, 4, 1]);
                    Process.start(this.memory.proQueue, pro, this.process_develop);
                }
            }
        }
    }

    /* Update process state in the process queue
       Input: massage
       Return: none
    */
    static promoProcess(msg) {
        var process = this.memory.proQueue[(msg[0] & 0x0F00) >>> 8];
        var funcList = null;
        
        switch (process.type) {
            case 'develop':
                funcList = this.process_develop;
                break;
            default:
                break;
        }

        Process.promote(process, funcList, msg[0]);
    }

    /* Monitor state of structures in each room, propose tasks if needed
       Input: none
       Return: none;
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

    /* Process: develop main room
       Token header: 0x2000
       Dependece: [0, 4, 1]
    */
    static process_develop = [

        /* Index 0: spawn creeps (x3)
           Predecessor: none (=0)
           Posdecessor: 1
        */
        {
            func: function(room, header) {
                var token = header | 0x0000;
                Demeter.propSpawnReq(C.WORKER, room, 0, null, token);
                Demeter.propSpawnReq(C.WORKER, room, 0, null, token);
                Demeter.propSpawnReq(C.WORKER, room, 0, null, token);
                Demeter.propSpawnReq(C.WORKER, room, 0, null, token);
            },
            dep: [1]
        },

        /* Index 1: upgrade controller (RCL->2, x2)
           Predecessor: [0]x4 (=4)
           Posdecessor: 2
        */
        {
            func: function(room, header) {
                var token = header | 0x0001;
                var fromNode = new Node({x: 0, y: 0, roomName: room}, 'source', null, true, 'source');
                var controller = Memory.nodePool[room].controller[0];
                var toNode = new Node(controller.pos, 'controller', controller.id);
                var task1 = tasks_worker.upgradeController(fromNode, toNode, 2, token);
                var task2 = tasks_worker.upgradeController(fromNode, toNode, 2, token);
                var task3 = tasks_worker.upgradeController(fromNode, toNode, 2, token);
                Demeter.propTask(task1, 3);
                Demeter.propTask(task2, 3);
                Demeter.propTask(task3, 3);
            },
            dep: [2]
        },

        /* Index ?: the end of process, send 'process terminate' message to message queue
           Predecessor: [1]x1 (=1)
           Posdecessor: none
        */
        {
            func: function(room, header) {
                var token = header | 0x0002;
                console.log("[Message] Process 'develop' terminated.");
            },
            dep: []
        },

        // /* Index n:
        //    Predecessor:
        //    Posdecessor: 
        // */
        // {
        //     func: function(room, header) {
                
        //     },
        //     dep: []
        // },
    ]
}

module.exports = Demeter;