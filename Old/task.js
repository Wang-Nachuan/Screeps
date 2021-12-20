const C = require("./constant");

class Task {

    constructor(taskType, taskPerformer, phaseNum, handlerKey, phaseBrach, para_in, targetID=null, targetPos=null) {
        // Set when task is created
        this.taskType = taskType;               // (const) Task type (real-time/dynamic)
        this.taskPerformer = taskPerformer;     // (const) Desired task performer
        this.phaseNum = phaseNum;               // (int) Number of phase
        this.handlerKey = handlerKey;           // (list of string) List of handler indexs
        this.phaseBrach = phaseBrach;           // (list of int) Next phase to branch to
        this.para = {
            in: para_in,                        // (list of list) Input for each phase
            targetID: targetID,                 // (ID of Object) Current target ID of task
            targetPos: targetPos,               // ([x, y, roomName]) Position of target
            share: null                         // (any type) Share data between phases
        };                     
        
        // Set later
        this.phaseCursor = 0;                   // (int) Index of current task functions in above lists
        this.id = null;                         // (string) ID of creep that is working on the task
        this.taskState = C.TASK_STATE_INACTIVE;             // (const) Active / Pending
    }

    /* Execute: excute task handler for all creeps belonging to a task, update task stamp if needed
       Input:
       - task: task objects
       - handlers: list of function lists
       Return:
       Note: it only updates task stamp, dose not update task array
    */
    static execute(task, handlers) {
        var obj = Game.getObjectById(task.id);
        var flage = handlers[task.handlerKey[task.phaseCursor]](obj, task.para, task.phaseCursor);

        if (flage == C.TASKHANDLER_PHASE_RET_FLG_FINISH) {
            // Update time stamp
            task.phaseCursor = task.phaseBrach[task.phaseCursor];
            // Pass finish information back to task scheduler
            if (task.phaseCursor >= task.phaseNum) {
                return C.TASKHANDLER_PHASE_RET_FLG_TERMINATE;
            } else {
                return C.TASKHANDLER_PHASE_RET_FLG_FINISH;
            }
        } else if (flage == C.TASKHANDLER_PHASE_RET_FLG_BRANCH) {
            task.phaseCursor += 1;
            return C.TASKHANDLER_PHASE_RET_FLG_FINISH;
        } else {
            return flage;
        }

    }
}

module.exports = Task;