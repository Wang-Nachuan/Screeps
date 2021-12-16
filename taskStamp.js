const C = require("./constant");
const TaskHandler = require('./taskHandler');

// Local constants
const REACH = 0;
const MOVING = 1;
const ERROR = 2;

class TaskStamp {

    constructor(taskIdx, taskType, taskPerformer, phaseNum, paraList_move, paraList_action) {
        // Set when TaskStamp is created
        this.taskIdx = taskIdx;                 // (const) Task index
        this.taskType = taskType;               // (const) Task type (real-time/dynamic)
        this.taskPerformer = taskPerformer;     // (const) Desired task performer
        this.phaseNum = phaseNum;               // (int) Number of phase
        this.paraList = {                       // (lists set of input lists) Extra inputs of taskExecute function at each phase
            move: paraList_move,                // Also can be used to pass data between phases
            action: paraList_action
        };
        // Set later
        this.phaseCursor = 0;                   // (int) Index of current task functions in above lists
        this.id = null;                         // (string) ID of creep that is working on the task
        this.taskState = C.TASKSTAMP_TASKSTATE_INACTIVE;             // (const) Active / Pending
        this.phaseState = C.TASKSTAMP_PHASESTATE_MOVE;               // (const) Move / Action
    }

    /* MoveToStd: standard (and optimized) move function for all creeps
       Input:
       - position: (RoomPosition) target position
       - creep: creep object
       Return:
       - (const) MOVING if still on the way
       - (const) ERROR if cannot move the desired postion (may caused by many reasons)
    */
    static moveToStd(target, creep) {
        if (creep.memory.role == C.WORKER || creep.memory.role == C.SOLDIER) {
            var returnVal = creep.moveTo(target);

            if (returnVal == OK) {
                return MOVING;
            } else {
                return ERROR;
            }
        } else {
            return MOVING;
        }
    }

    /* Execute: excute task handler for all creeps belonging to a task, update task stamp if needed
       Input:
       - taskExecute: list of execution functions references
       Return:
       Note: it only updates task stamp, dose not update task array
    */
    static execute(taskStamp, taskList) {
        var handler = taskList[taskStamp.taskIdx];   // Shortcut reference for task handler
        var creep = Game.getObjectById(taskStamp.id);

        if (taskStamp.phaseState == C.TASKSTAMP_PHASESTATE_MOVE) {
            // Move
            var target = handler.moveList[taskStamp.phaseCursor](creep, taskStamp.paraList);
            
            if (target == C.TASKHANDLER_MOVE_RET_FLG_ERROR) {
                /* TODO: handle failure */
                console.log('[ERROR] In taskStamp.js.');
            } else if (target == C.TASKHANDLER_MOVE_RET_FLG_REACH) {
                
                taskStamp.phaseState = C.TASKSTAMP_PHASESTATE_ACTION;
            } else {
                var moveFlage = this.moveToStd(target, creep);
                if (moveFlage == C.TASKHANDLER_MOVE_RET_FLG_ERROR) {
                    /* TODO: handle failure */
                    console.log('[ERROR] In taskStamp.js.');
                } else {}
            }
        } else {
            // Action
            var ret = handler.actionList[taskStamp.phaseCursor](creep, taskStamp.paraList);
            var actionFlage = ret[0];
            var branchIdx = ret[1];

            if (actionFlage == C.TASKHANDLER_ACTION_RET_FLG_FINISH) {
                // Update time stamp
                taskStamp.phaseState = C.TASKSTAMP_PHASESTATE_MOVE;
                taskStamp.phaseCursor = branchIdx;
                // Pass finish information back to task scheduler
                if (taskStamp.phaseCursor >= taskStamp.phaseNum) {
                    return C.TASKHANDLER_ACTION_RET_FLG_TERMINATE;
                } else {
                    return C.TASKHANDLER_ACTION_RET_FLG_FINISH;
                }
            } else {
                return actionFlage;
            }
        }
    }
}

module.exports = TaskStamp;