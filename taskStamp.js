const C = require("./constant");
const TaskHandler = require('./taskHandler');

// Local constants
const REACH = 0;
const MOVING = 1;
const ERROR = 2;

class TaskStamp {

    constructor(taskIdx, taskType, taskPerformer, phaseNum, paraList_move, paraList_action, paraList_end) {
        // Set when TaskStamp is created
        this.taskIdx = taskIdx;                 // (const) Task index
        this.taskType = taskType;               // (const) Task type (real-time/dynamic)
        this.taskPerformer = taskPerformer;     // (const) Desired task performer
        this.phaseNum = phaseNum;               // (int) Number of phase
        this.paraList_move = paraList_move      // (list of input lists) Extra inputs of taskExecute function at each phase
        this.paraList_action = paraList_action
        this.paraList_end = paraList_end
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
       - (const) REACH if creep is within the acceptable range
       - (const) MOVING if still on the way
       - (const) ERROR if cannot move the desired postion (may caused by many reasons)
    */
    static moveToStd(target, creep) {

        var returnVal_2 = creep.moveTo(target);

        if (returnVal_2 == OK) {
            return MOVING;
        } else {
            return ERROR;
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
            var target = handler.moveList[taskStamp.phaseCursor](creep, taskStamp.paraList_move[taskStamp.phaseCursor]);

            if (target == ERROR) {
                /* TODO: handle failure */
                console.log('[ERROR] In taskStamp.js.');
            } else if (target == REACH) {
                taskStamp.phaseState = C.TASKSTAMP_PHASESTATE_ACTION;
            } else {
                var moveFlage = this.moveToStd(target, creep);
                if (moveFlage == ERROR) {
                    /* TODO: handle failure */
                    console.log('[ERROR] In taskStamp.js.');
                } else {}
            }
        } else {
            // Action
            var ret = handler.actionList[taskStamp.phaseCursor](creep, taskStamp.paraList_action[taskStamp.phaseCursor]);
            var actionFlage = ret[0];
            var branchIdx = ret[1];

            if (actionFlage == C.TASKHANDLER_ACTION_RET_FLG_FINISH) {
                // Execute finish function
                handler.endList[taskStamp.phaseCursor](creep, taskStamp.paraList_end[taskStamp.phaseCursor]);
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