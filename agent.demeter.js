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
        this.monitorCreepNum();
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
                case C.MSG_TASK_HALT:
                    break;
                case C.MSG_PROCESS_TERMINATE:
                    Process.end(this.memory.proQueue, msg[0]);
                    this.memory.statistics.proNum -= 1;
                    break;
                case C.MSG_REPORT_EMERGENCY:
                    break
                case C.MSG_CREEP_DEATH:
                    break;
                default:
                    break;
            }
        }
        // Reset message queue
        this.memory.msgQueue = [];
    }

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

    /* Process: develop main room
       Token header: 0x2000
       Dependece: [0, 0, 1]
    */
    static process_develop = [

        /* Index 0: spawn creeps
           Predecessor: none
           Posdecessor: 
        */
        {
            func: function(process, room, header) {
                var token = header | 0x0000;
                Demeter.memory.statistics.targetNum.worker += 2;
            },
            dep: [],
            weight: 0      // Weight of dependence
        },


        /* Index ?: the end of process, send 'process terminate' message to message queue
           Predecessor: 1
           Posdecessor: none
        */
        {
            func: function(process, room, header) {
                // var token = header | 0x0002;
                // console.log("[Message] Process 'develop' terminated.");
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
    ]
}

module.exports = Demeter;