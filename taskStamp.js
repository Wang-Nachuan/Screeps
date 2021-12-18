const C = require("./constant");

// Local constants
const REACH = 0;
const MOVING = 1;
const ERROR = 2;

class TaskStamp {

    constructor(taskType, taskPerformer, phaseNum, handlerIdx, phaseBrach, para_in, targetID=null, targetPos=null) {
        // Set when TaskStamp is created
        this.taskType = taskType;               // (const) Task type (real-time/dynamic)
        this.taskPerformer = taskPerformer;     // (const) Desired task performer
        this.phaseNum = phaseNum;               // (int) Number of phase
        this.handlerIdx = handlerIdx;           // (list of const) List of handler indexs
        this.phaseBrach = phaseBrach;           // (list of int) Next phase to branch to
        this.para = {
            io: [],                             // (list of {in: [], out: []}) Parameters for each phase
            targetID: targetID,                 // (ID of Object) Current target ID of task
            targetPos: targetPos                // ([x, y, roomName]) Position of target
        };                     
        for (var i = 0; i < phaseNum; i++) {
            this.para.io.push({in: para_in[i], out: []});
        }

        // Set later
        this.phaseCursor = 0;                   // (int) Index of current task functions in above lists
        this.id = null;                         // (string) ID of creep that is working on the task
        this.taskState = C.TASKSTAMP_TASKSTATE_INACTIVE;             // (const) Active / Pending
    }

    /* Execute: excute task handler for all creeps belonging to a task, update task stamp if needed
       Input:
       - taskStamp: taskStamp objects
       - handlerList: list of function lists
       Return:
       Note: it only updates task stamp, dose not update task array
    */
    static execute(taskStamp, handlerList) {
        var obj = Game.getObjectById(taskStamp.id);

        // Action
        var actionFlage = handlerList[taskStamp.handlerIdx[taskStamp.phaseCursor]](obj, taskStamp.para, taskStamp.phaseCursor);
        if (actionFlage == C.TASKHANDLER_PHASE_RET_FLG_FINISH) {
            // Update time stamp
            taskStamp.phaseCursor = taskStamp.phaseBrach[taskStamp.phaseCursor];
            // Pass finish information back to task scheduler
            if (taskStamp.phaseCursor >= taskStamp.phaseNum) {
                return C.TASKHANDLER_PHASE_RET_FLG_TERMINATE;
            } else {
                return C.TASKHANDLER_PHASE_RET_FLG_FINISH;
            }
        } else {
            return actionFlage;
        }

    }
}

module.exports = TaskStamp;