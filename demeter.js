const Plato = require('./plato');
const TaskStamp = require('./taskStamp');
const C = require("./constant");

const TIME_LINE = [];
const TIME_LINE_LEN = TIME_LINE.length;

class Demeter extends Plato {

    static init() {
        // Initialize memory when run constructor at the first time
        if (Memory.initFlag == 1) {

            Memory.agents.Demeter = {
                timelineCursor: 0
            }
                
        }
    }

    /* Function: routine function that run at the begining of each tick
       Input: none 
       Return: none
    */
    static routine() {
        if (Memory.agents.Demeter.timelineCursor == 0) {
            Memory.agents.Demeter.timelineCursor += 1;
            this.setTask(this.taskStamp_spawn(C.WORKER, [WORK, CARRY, MOVE, MOVE, MOVE]), 0);
            this.setTask(this.taskStamp_spawn(C.WORKER, [WORK, CARRY, MOVE, MOVE, MOVE]), 0)
        }
        if (Memory.agents.Demeter.timelineCursor == 1) {
            Memory.agents.Demeter.timelineCursor += 1;
            this.setTask(this.taskStamp_harvest(), 2);
            this.setTask(this.taskStamp_upgradeController(), 2);
            this.setTask(this.taskStamp_upgradeController(), 2);
        }
        if (Memory.agents.Demeter.timelineCursor == 2) {
            Memory.agents.Demeter.timelineCursor += 1;
        }
    }


    /* Function:
       Input
       - : 
       - : 
       Return
       - 
    */
    
    /*------------------------------ Shortcuts for creating taskStamp ------------------------------*/

    /* Input
       - type: (const) C.WORKER/C.SOLDIER
       - body: (list of const) list of body parts
    */
    static taskStamp_spawn(type, body) {
        var handlerIdx = [
            C.TASKHANDLER_SPAWN_0_STARTSPAWN,
            C.TASKHANDLER_SPAWN_1_FINISHSPAWN
        ];
        var para_in = [
            [type, body], 
            null
        ];
        return new TaskStamp(C.TASKSTAMP_TASKTYPE_REALTIME, C.SPAWN, 2, handlerIdx, [1, 2], para_in);
    }

    /* Input: none
    */
       static taskStamp_harvest() {
        var handlerIdx = [
            C.TASKHANDLER_WORKER_1_FIND,
            C.TASKHANDLER_WORKER_0_MOVETO,
            C.TASKHANDLER_WORKER_2_HARVEST,
            C.TASKHANDLER_WORKER_1_FIND,
            C.TASKHANDLER_WORKER_0_MOVETO,
            C.TASKHANDLER_WORKER_3_TRANSFER
        ];
        var para_in = [
            [FIND_SOURCES, false], 
            [1, true], 
            null, 
            [FIND_STRUCTURES, true, [STRUCTURE_SPAWN, STRUCTURE_EXTENSION]], 
            [1, true], 
            [RESOURCE_ENERGY]
        ];
        return new TaskStamp(C.TASKSTAMP_TASKTYPE_REALTIME, C.WORKER, 6, handlerIdx, [1, 2, 3, 4, 5, 0], para_in);
    }

    /* Input: none
    */
    static taskStamp_upgradeController() {
        var handlerIdx = [
            C.TASKHANDLER_WORKER_1_FIND,
            C.TASKHANDLER_WORKER_0_MOVETO,
            C.TASKHANDLER_WORKER_2_HARVEST,
            C.TASKHANDLER_WORKER_1_FIND,
            C.TASKHANDLER_WORKER_0_MOVETO,
            C.TASKHANDLER_WORKER_4_UPGRADE
        ];
        var para_in = [
            [FIND_SOURCES, false], 
            [1, true], 
            null, 
            [FIND_STRUCTURES, true, [STRUCTURE_CONTROLLER]], 
            [1, true], 
            null
        ];
        return new TaskStamp(C.TASKSTAMP_TASKTYPE_REALTIME, C.WORKER, 6, handlerIdx, [1, 2, 3, 4, 5, 0], para_in);
    }

}

module.exports = Demeter;