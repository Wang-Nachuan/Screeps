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
            if (Memory.rooms.developing.includes(room)) {
                if (this.memory.statistics.proNum <= 16) {
                    this.memory.statistics.proNum += 1;
                    Memory.rooms.developing.push(room);
                    var pro = new Process(C.TOKEN_HEADER_DEMETER, 'develop', room, [0, 4, 1]);
                    Process.start(this.memory.proQueue, pro, process_develop);
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
        var process = this.memory.msgQueue[(msg[0] & 0x0F00) >>> 8];
        var funcList = null;

        switch (process.type) {
            case 'develop':
                funcList = this.process_develop;
                break;
            default:
                break;
        }

        Process.prompt(process, funcList);
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
            func: function(room, proToken) {
                var token = proToken | 0x0001;
                this.propSpawnReq(C.WORKER, room, 3, null, token);
                this.propSpawnReq(C.WORKER, room, 3, null, token);
                this.propSpawnReq(C.WORKER, room, 3, null, token);
                this.propSpawnReq(C.WORKER, room, 3, null, token);
            },
            dep: [1]
        },

        /* Index 1: upgrade controller (RCL->2, x2)
           Predecessor: [0]x4 (=4)
           Posdecessor: 2
        */
        {
            func: function(room, proToken) {
                var token = proToken | 0x0002;
                var fromNode = new Node({x: 0, y: 0, roomName: room}, 'source', null, true, 'source');
                var controller = Game.getObjectById(Memory.nodePool.controller[0]);
                var toNode = new Node(controller.pos, 'controller', controller.id);
                var task = tasks_worker.upgradeController(fromNode, toNode, 2, token);
                this.propTask(task, 3);
            },
            dep: [2]
        },

        /* Index ?: the end of process, send 'process terminate' message to message queue
           Predecessor: [1]x1 (=1)
           Posdecessor: none
        */
        {
            func: function(room, proToken) {
                var token = proToken | 0x0003;
                console.log('[Message] Process terminated.');
                
            },
            dep: []
        },

        // /* Index n:
        //    Predecessor:
        //    Posdecessor: 
        // */
        // {
        //     func: function(room, proToken) {
                
        //     },
        //     dep: []
        // },
    ]
}

module.exports = Demeter;