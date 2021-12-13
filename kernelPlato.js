const C = require("./constant");
var TaskStamp = require("./taskStamp");
var taskList_spawn = require("./taskListSpawn");
var taskList_worker = require("./taskListWorker");

class Plato {

    static init() {
        // Initialize memory when run constructor at the first time
        if (Memory.initFlag == 0) {

            Memory.initFlag = 1;
            
            // Task array
            Memory.taskArray = {realTime: Array(C.PLATO_LEN_TASKARRAY_REALTIME), dynamic: Array(C.PLATO_LEN_TASKARRAY_DYNAMIC)};
            for (i = 0; i < C.PLATO_LEN_TASKARRAY_REALTIME; i++) {
                Memory.taskArray.realTime[i] = [];
            }
            for (i = 0; i < C.PLATO_LEN_TASKARRAY_DYNAMIC; i++) {
                Memory.taskArray.dynamic[i] = [];
            }
            
            // Spawn queue
            Memory.spawnQueue = {requested: [], accepted: []};

            // Newly born object name list
            Memory.newObject = ['Spawn0'];

            // ID pools of all objects
            Memory.pool = {spawn: [], worker: [], soldier: []};
            
            // Statistics
            Memory.statistics = {spawnNum: 1, creepNum: 0, creepWorkerNum: 0, creepSoldierNum: 0};
        }
    }

    /* Function: routine function that run at the begining of each tick
       Input: none
       Return: none
    */
    static routine() {
        ;
    }

    /*----------------------------------- Public Methods -----------------------------------*/

    /* Function:
       - Add a task stamp to the task array, update some states accordingly
       Input
       - taskStamp
       - prio: priority of task (0-C.PLATO_LEN_TASKARRAY_REALTIME/DYNAMIC-1, smaller means higher priority)
       Return: none
       * Note: users should check for themselves the right condition to issue a specific task
    */
    static setTask(taskStamp,  prio) {
        if (taskStamp.taskType == C.TASKSTAMP_TASKTYPE_REALTIME) {
            Memory.taskArray.realTime[prio].push(taskStamp);
            /* TODO: Updata states (if needed) */
        } else {
            Memory.taskArray.dynamic[prio].push(taskStamp);
            /* TODO: Updata states (if needed) */
        }
    }

    /* Function:
       - Add spawn request to the spawn queue
       Input
       - type: 'worker'/'soldier'
       - body: array of body parts
       Return: none
    */
    static setSpawnReq(type, body) {
        var request = {type: type, body: body};
        Memory.spawnQueue.requested.push(request);
    }


    /*----------------------------------- Private Methods -----------------------------------*/

    /* Function:
       - Process spawn request
       Input: none
       Return: none
    */
    static assignSpawnReq() {

        var cursor = 0;

        // Loop through all spawns
        for (id in Memory.pool.spawn) {

            var spawn = Game.getObjectById(id);

            // Check whether the spawn is free
            if (spawn.spawning == null) {
                var request = Memory.spawnQueue.requested[cursor];
                var name = request.type + Memory.statistics.creepNum;

                // Try to spawn, if success, move request from requested queue to accepted queue
                // Otherwise, skip this reuqest for now
                if (spawn.spawnCreep(request.body, name) == OK) {
                    request.spawn = id;     // Attach spawn id to the accepted request
                    Memory.spawnQueue.accepted.push(request);
                    Memory.spawnQueue.requested.splice(cursor, 1);
                    Memory.statistics.creepNum += 1;
                    Memory.newObject.push(name);
                } else {
                    /* TODO: handle failure */
                }

                cursor += 1;
            }
        }

        /* TODO: monitor the accepted task */
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
       - Add some fields to new object, move them to corresponding lists
       Input: none
       Return: none
    */
    static educate() {
        for (objName in Memory.newObject) {
            // var obj = 
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