const C = require("./constant");

// Local constants
REACH = 0;
MOVING = 1;
ERROR = 2;

class TaskStamp {

    constructor(taskIdx, taskType, taskPerformer, phaseNum, paraList_move, paraList_action, paraList_end) {
        this.taskIdx = taskIdx;             // (const) Task index
        this.taskType = taskType;           // (const) Task type (real-time/dynamic)
        this.taskTag = taskPerformer;       // (const) Desired task performer
        this.phaseNum = phaseNum;           // (int) Number of phase
        this.paraList_move = paraList_move  // (list of input lists) Extra inputs of taskExecute function at each phase
        this.paraList_action = paraList_action
        this.paraList_end = paraList_end
        this.phaseCount = 0;                // (int) Index of current task functions in above lists
        this.id = '';                       // (string) ID of creep that is working on the task
        this.taskState = C.ACTIVE;          // (const) Active / Pending
        this.phaseState = C.MOVE;           // (const) Move / Action
    }

    /* MoveStd: standard move function
       Input:
       - position: (RoomPosition) target position
       - creep: creep object
       Return:
       - (const) REACH if creep is within the acceptable range
       - (const) MOVING if still on the way
       - (const) ERROR if cannot move the desired postion (may caused by many reasons)
    */
   moveStd(target, creep) {
       ;
   }

    /* Execute: excute task handler for all creeps belonging to a task, update task stamp if needed
       Input:
       - taskExecute: list of execution functions references
       Return:
       Note: it only updates task stamp, dose not update task array
    */
    execute(taskList) {

        var handler = taskList[this.taskIdx];   // Shortcut reference for task handler
        var creep = Game.getObjectById(this.id);

        if (this.phaseState == C.MOVE) {
            // Move
            var target = handler.moveList[this.phaseCount](creep, this.paraList_move[this.phaseCount]);
            if (target == false) {
                /* TODO: handle failure */
            } else {
                var moveFlage = this.moveStd(position, obj);
                if (moveFlage == REACH) {
                    this.phaseState = C.ACTION;
                } else if (moveFlage == ERROR) {
                    /* TODO: handle failure */
                } else {}
            }
        } else {
            // Action
            var actionFlage = handler.actionList[this.phaseCount](creep, this.paraList_action[this.phaseCount]);
            if (actionFlage == C.FINISH) {
                //Execute finish function
                handler.endList[this.phaseCount](creep, this.paraList_end[this.phaseCount]);
                // Update time stamp
                this.phaseState = C.MOVE;
                this.phaseCount += 1;   // Need to change!!!!!!
                // Pass finish information back to caller
                if (this.phaseCount >= this.phaseNum) {
                    return C.TERMINATE;
                } else {
                    return C.FINISH;
                }
            } else {
                return actionFlage;
            }
        }
    }
}

module.exports = TaskStamp;