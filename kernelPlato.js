const C = require("./constant");
var TaskStamp = require("./taskStamp");
var taskList_spawn = require("./taskListSpawn");
var taskList_worker = require("./taskListWorker");

class Plato {

    static init() {
        // Initialize memory when run constructor at the first time
        if (Memory.initFlag == 0) {

            Memory.initFlag = 1;
            
            Memory.taskArray = {realTime: Array(C.lengthRealTimeArray), dynamic: Array(C.lengthDynamicArray)};
            for (i = 0; i < C.lengthRealTimeArray; i++) {
                Memory.taskArray.realTime[i] = [];
            }
            for (i = 0; i < C.lengthDynamicArray; i++) {
                Memory.taskArray.dynamic[i] = [];
            }
            
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