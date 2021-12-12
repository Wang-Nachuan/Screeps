const C = require("./constant");

class TaskStamp {

    constructor(taskIdx, taskType, taskPerformer, phaseNum, paraList) {
        this.taskIdx = taskIdx;             // (const) Task index
        this.taskType = taskType;           // (const) Task type (real-time/dynamic)
        this.taskTag = taskPerformer;       // (const) Desired task performer
        this.phaseNum = phaseNum;           // (int) Number of phase
        this.para = paraList                // (list of input lists) Extra input of taskExecute function at each phase
        this.phaseCount = 0;                // (int) Index of current task functions in above lists
        this.objectList = [];               // (string list) Name of objects that are working on the task
        this.taskState = C.ACTIVE;          // (const) Active / Pending
        this.phaseState = C.MOVE;           // (const) Move / Action
    }

    /* Function: excute task handler for all creeps belonging to a task, update task stamp if needed
       Input
       - taskExecute: list of execution functions references
       Return: none
    */
    execute(taskList) {
        console.log(1);
    }
}

module.exports = TaskStamp;