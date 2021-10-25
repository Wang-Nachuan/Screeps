const Archive = require("./l0_archive");
const C = require("./constant");

class Plato extends Archive {

    constructor() {
        super();
        Memory.taskQueue = {Emergency: [], Fixed: [], Dynamic: []};
        Memory.taskNum = {Emergency: 0, Fixed: 0, Dynamic: 0};
    }

    /*------------------------------Shortcut to memory-----------------------------*/
    get taskQueue() {
        return Memory.taskQueue;
    }

    get taskNum() {
        return Memory.taskNum;
    }

    
    /*-----------------------------------Methods-----------------------------------*/

    /* Function: receive a desired amount of change of a item, generate a task, add it to the task queue
       Input
       - taskType: (cont) Task type
       - taskHandler: (function reference list) Functions of the task phases
       - taskCheck: (function reference list) Functions that check the end of task phases (jump if true)
       - taskChara: (cont) Task characteristics (SINGLE, PERSIS, etc.)
       Return: none
       * Note: users should check for themselves the right condition to issue a specific task
    */
    setTask(taskType, taskHandler, taskCheck, taskChara) {

        var task = Task(taskType, taskHandler, taskCheck);

        if (taskChara == C.EVEEM) {
            this.taskNum.Emergency = this.taskQueue.Emergency.push(task);
        } else if (taskChara == C.PERSIS) {
            this.taskNum.Fixed = this.taskQueue.Fixed.push(task);
        } else {
            this.taskNum.Dynamic = this.taskQueue.Dynamic.push(task);
        }
    }

    /* Function: 
       - check the terminate condition of each active task in the queue
       - assign appropriate amount (currently 1) of workers to each task, excute handler on those workers
       - remove any task that is finished
       - activate sleeping tasks if there are remaining workers / send some task to sleep if no worker remains
       - * tasks are assigned in Emergency > Fixed > Dynamic order
       Input
       - : 
       - : 
       Return
       - 
    */
    assignTask() {
        ;
    }


    /* Function:
       Input
       - : 
       - : 
       Return
       - 
    */

}



class Task {

    constructor(taskType, taskHandler, taskCheck) {
        this.taskType = taskType;           // (cont) Task type
        this.taskHandler = taskHandler;     // (function reference list) Functions of the task phases
        this.taskCheck = taskCheck;         // (function reference list) Functions that check the end of task phases (jump if true)
        this.phaseCount = 0;                // (int) Index of current task functions in above lists
        this,phaseMax = taskHandler.length; // (int) Number of phase
        this.workerList = [];               // (creep object list) Workers that are working on the task
        this.isActive = false;              // (boolean) Is the task being excuted by workers
    }

    /* Function: check and update the phase of task
       Input: none
       Return: 0 if stay in current phase, 1 if move to next phase, 2 if the task has been complete
    */
    check() {
        var returnValue = 0;
        if (this.taskCheck[this.phaseCount]()) {
            this.phaseCount += 1;
            returnValue = 1;
        }
        if (this.phaseCount >= this.phaseMax) {
            returnValue = 2;
        }
        return returnValue;
    }

    /* Function: excute task handler for all creeps belonging to a task
       Input: none
       Return: none
    */
    execute() {
        for (creep in this.workerList) {
            this.taskHandler[this.phaseCount](creep);
        }
    }
}

module.exports = Plato;