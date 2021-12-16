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

            // Newly born object name list (e.g. 'Spawn0', 'Worker2', 'Soldier3')
            Memory.newObject = ['Spawn0'];

            // ID pools of all objects
            Memory.objectIDPool = {spawn: [], worker: [], soldier: []};
            
            // Statistics
            Memory.statistics = {spawnNum: 1, creepNum: 0, creepWorkerNum: 0, creepSoldierNum: 0};

            // Set memory space for agents
            Memory.agents = {};
        }
    }

    /* Function: routine function that run at the begining of each tick
       Input: none
       Return: none
    */
    static routine() {
        this.educate();
        this.assignSpawnReq();
        this.assignTask();
    }

    /*----------------------------------- Public Methods -----------------------------------*/

    /* Function:
       - Add spawn request to the spawn queue
       Input
       - type: 'C.WORKER'/'C.SOLDIER'
       - body: array of body parts
       Return: none
    */
       static setSpawnReq(type, body) {
        var request = {type: type, body: body};
        Memory.spawnQueue.requested.push(request);
    }

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

    /*----------------------------------- Private Methods -----------------------------------*/

    /* Function:
       - Process spawn request
       Input: none
       Return: none
    */
    static assignSpawnReq() {
        var cursor = 0;

        // Loop through all spawns
        if (Memory.spawnQueue.requested.length != 0) {
            for (var id of Memory.objectIDPool.spawn) {
                var spawn = Game.getObjectById(id);
    
                // Check whether the spawn is free
                if (spawn.spawning == null) {
                    var request = Memory.spawnQueue.requested[cursor];
                    var name = request.type + Memory.statistics.creepNum;
    
                    // Try to spawn, if success, move request from requested queue to accepted queue
                    // Otherwise, skip this reuqest for now
                    if (spawn.spawnCreep(request.body, name) == OK) {
                        spawn.busy = true;
                        request.spawnID = id;       // Attach spawn id to the accepted request
                        request.creepName = name;   // Name is added to newObject list when when spawning finishs
                        Memory.spawnQueue.accepted.push(request);
                        Memory.spawnQueue.requested.splice(cursor, 1);
                    } else {
                        /* TODO: handle failure */
                    }
    
                    cursor += 1;
                }
            }
        }

        // Monitor the accepted tasks
        if (Memory.spawnQueue.accepted != 0) {
            cursor = 0;

            for (var request of Memory.spawnQueue.accepted) {
                var spawn = Game.getObjectById(request.spawnID);

                // Check whether the spawn finished
                if (spawn.spawning == null) {
                    if (request.type == C.WORKER) {
                        Memory.statistics.creepWorkerNum += 1;
                    } else {
                        Memory.statistics.creepSoldierNum += 1;
                    }
                    Memory.statistics.creepNum += 1;
                    spawn.busy = false;
                    Memory.newObject.push(request.creepName);
                    Memory.spawnQueue.accepted.splice(cursor, 1);
                }

                cursor += 1;
            }
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

    }

    /* Function:
       - Add some fields to new object, move them to corresponding lists
       Input: none
       Return: none
       Fields for Spawn:
       - busy: (boolean) whether the spawn is working on a spawn request
       Fields for worker/soldier:
       - busy: (boolean) whether the creep is working on a task
       - taskIdx: (list) [array (0 for real-time, 1 or priority), priority, index in the inner list]
    */
    static educate() {
        var cursor = 0;

        for (var objName of Memory.newObject) {
            if (objName[2] == 'a') {    // Spawn
                var obj = Game.spawns[objName];
                obj.busy = false;
                Memory.objectIDPool.spawn.push(obj.id);
            } else if (objName[2] == 'r') {     // Worker
                var obj = Game.creeps[objName];
                obj.busy = false;
                obj.taskIdx = null;
                Memory.objectIDPool.worker.push(obj.id);
            } else if (objName[2] == 'l') {     // Soldier
                var obj = Game.creeps[objName];
                obj.busy = false;
                obj.taskIdx = null;
                Memory.objectIDPool.soldier.push(obj.id);
            } else {}

            Memory.newObject.splice(cursor, 1);
            cursor += 1;
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