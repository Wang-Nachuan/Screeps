const C = require("./assist_constant");
var TaskStamp = require("./assist_taskStamp");
var taskList_spawn = require("./taskList_spawn");
var taskList_worker = require("./taskList_worker");

class Plato {

    static init() {
        // Initialize memory when run constructor at the first time
        if (Memory.initFlag == 0) {
            Memory.initFlag = 1;

            // ID list
            Memory.workerList = [];
            Memory.soldierList = [];
            Memory.spawnList = [];
            // Task queue for worker 
            Memory.workerTaskQueue = {Emergency: [], Fixed: [], Dynamic: []};   // Each item: [task index, [[para for phase 1], [para for phase 2], ... ]]
            Memory.workerTaskNum = {Emergency: 0, Fixed: 0, Dynamic: 0};
            // Task queue for soldier
            Memory.soldierTaskQueue = {Emergency: [], Fixed: [], Dynamic: []};
            Memory.soldierTaskNum = {Emergency: 0, Fixed: 0, Dynamic: 0};
            // Task queue for spawn
            Memory.spawnTaskQueue = {Emergency: [], Fixed: [], Dynamic: []};
            Memory.spawnTaskNum = {Emergency: 0, Fixed: 0, Dynamic: 0};
        }
    }

    /*-----------------------------------Methods-----------------------------------*/

    /* Function: receive a desired amount of change of a item, generate a task, add it to the task queue
       Input
       - idx: task index
       - type: task type
       - tag: task tage
       - phaseNum: number of phase
       - taskIdx: task index in corresponding task list
       - para: list of parameter lists for each phase
       Return: none
       * Note: users should check for themselves the right condition to issue a specific task
    */
    static setTask(idx, type, tag, phaseNum, para) {

        var queue = null;
        var num = null;
        var taskStamp = new TaskStamp(idx, type, tag, phaseNum, para);

        switch (type) {
            case C.WORKER:
                queue = Memory.workerTaskQueue;
                num = Memory.workerTaskNum;
                break;
            case C.SOLDIER:
                queue = Memory.soldierTaskQueue;
                num = Memory.soldierTaskNum;
                break;
            case C.SPAWN:
                queue = Memory.spawnTaskQueue;
                num = Memory.spawnTaskNum;
                break;
        }

        if (tag == C.EVEEM) {
            num.Emergency = queue.Emergency.push(taskStamp);
        } else if (tag == C.PERSIS) {
            num.Fixed = queue.Fixed.push(taskStamp);
        } else {
            num.Dynamic = queue.Dynamic.push(taskStamp);
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
    static assignTask() {

        var loop1 = [Memory.workerList, Memory.workerTaskQueue, Memory.workerTaskNum, taskList_worker, Game.creeps];
        var loop2 = [Memory.soldierList, Memory.soldierTaskQueue, Memory.soldierTaskNum];
        var loop3 = [Memory.spawnList, Memory.spawnTaskQueue, Memory.spawnTaskNum, taskList_spawn, Game.spawms];
        var nameList, taskQueue, taskNum, objNum;

        for (var i in [loop1, loop3]) {
            nameList = i[0];
            taskQueue = i[1];
            taskNum = i[2];
            taskList = i[3];
            objRef = i[4]
            objNum = nameList.length;   // Remaining available objects

            for (var j in ['Emergency', 'Fixed', 'Dynamic']) {
                for (var task in taskQueue[j]) {
                    if (task.isActive) {
                        // Check terminate condition of task
                        if  (2 == task.check()) {
                            // @TODO
                        }
                        // Execute task
                        task.execute(taskList[task.taskIdx]);
                    } else {
                        // Allocate a object to the task if possible
                        if (objNum > 0) {
                            objNum -= 1;
                            task.objectList.push(objRef[nameList[objNum]]);
                            // Have some problems to be fixed
                        }
                    }
                }
            }
            
        }
    }


    /* Function:
       Input
       - : 
       - : 
       Return
       - 
    */

}

module.exports = Plato;