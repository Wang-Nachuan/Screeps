class TaskStamp {

    constructor(taskIdx, taskType, taskTag, phaseNum, para) {
        this.taskIdx = taskIdx;     // (const) Task index
        this.taskType = taskType;   // (const) Task type
        this.taskTag = taskTag;     // (const) Task tag
        this.phaseNum = phaseNum;   // (int) Number of phase
        this.para = para            // (list of input lists) Input of taskExecute function at each phase
        this.phaseCount = 0;        // (int) Index of current task functions in above lists
        this.objectList = [];       // (object list) Objects that are working on the task
        this.isActive = false;      // (boolean) Is the task being excuted by workers
    }

    /* Function: check and update the phase of task
       Input
       - taskCheck: function references list of check function
       Return
       - 0 if stay in current phase, 1 if move to next phase, 2 if the task has been complete
    */
    check(taskCheck) {
        var returnValue = 0;
        if (taskCheck[this.phaseCount]()) {
            this.phaseCount += 1;
            returnValue = 1;
        }
        if (this.phaseCount >= this.phaseNum) {
            returnValue = 2;
        }
        return returnValue;
    }

    /* Function: excute task handler for all creeps belonging to a task
       Input
       - taskExecute: liet of execution functions references
       Return: none
    */
    execute(taskExecute) {
        for (object in this.objectList) {
            taskExecute[this.phaseCount](object, this.para[this.phaseCount]);
        }
    }
}

module.exports = TaskStamp;