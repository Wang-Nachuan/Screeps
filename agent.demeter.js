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

class Demeter extends Plato {

    static get memory() {return Memory.agents.demeter;}
    static set memory(newVal) {Memory.agents.demeter = newVal;}

    /* Wrapper function run in the main loop
       Input: none
       Return: none
    */
    static wrapper() {
        this.deliverMsg();

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
                    break;
                default:
                    break;
            }
        }
        // Reset message queue
        this.memory.msgQueue = [];
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

                // For test only
                var fromNode = Memory.nodePool.source[0];
                var toNode = Memory.nodePool.spawn[0];
                var task = tasks_worker.harvestEnergy(fromNode, toNode);
                Demeter.propTask(task, 2);
                Demeter.propTask(task, 2);
            },
            dep: [1]
        },

        /* Index 1: upgrade controller (RCL->2, x2)
           Predecessor: [0]x4 (=4)
           Posdecessor: 2
        */
        {
            func: function(room, header) {
                console.log('[Message] Task proposed');
                var token = header | 0x0001;
                var fromNode = new Node({x: 0, y: 0, roomName: room}, 'source', null, true, 'source');
                var controller = Memory.nodePool.controller[0];
                var toNode = new Node(controller.pos, 'controller', controller.id);
                var task = tasks_worker.upgradeController(fromNode, toNode, 2, token);
                Demeter.propTask(task, 3);
                Demeter.propTask(task, 3);
                Demeter.propTask(task, 3);
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
                console.log('[Message] Process terminated.');
                
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