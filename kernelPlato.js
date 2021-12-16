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
            Memory.taskArray = [Array(C.PLATO_LEN_TASKARRAY_REALTIME), Array(C.PLATO_LEN_TASKARRAY_DYNAMIC)];
            for (i = 0; i < C.PLATO_LEN_TASKARRAY_REALTIME; i++) {
                Memory.taskArray[0][i] = [];
            }
            for (i = 0; i < C.PLATO_LEN_TASKARRAY_DYNAMIC; i++) {
                Memory.taskArray[1][i] = [];
            }
            
            // Spawn queue
            Memory.spawnQueue = {requested: [], accepted: []};

            // Newly born object name list (e.g. 'Spawn0', 'Worker2', 'Soldier3')
            Memory.newObject = ['Spawn0'];

            // ID pools of all objects
            Memory.objectPool = {spawn: [], worker: [], soldier: []};
            
            // Statistics
            Memory.statistics = {spawnNum: 0, creepNum: 0, creepWorkerNum: 0, creepSoldierNum: 0};

            // Set memory space for agents
            Memory.agents = {};
        }
    }

    /* Routine: routine function that run at the begining of each tick
       Input: none
       Return: none
    */
    static routine() {
        this.educate();
        this.assignSpawnReq();
        this.assignTask();
    }

    /*----------------------------------- Public Methods -----------------------------------*/

    /* SetSpawnReq: add spawn request to the spawn queue
       Input
       - type: 'C.WORKER'/'C.SOLDIER'
       - body: array of body parts
       Return: none
    */
    static setSpawnReq(type, body) {
        var request = {type: type, body: body};
        Memory.spawnQueue.requested.push(request);
    }

    /* SetTask: add a task stamp to the task array, update some states accordingly
       Input
       - taskStamp
       - prio: priority of task (0-C.PLATO_LEN_TASKARRAY_REALTIME/DYNAMIC-1, smaller means higher priority)
       Return: none
       * Note: users should check for themselves the right condition to issue a specific task
    */
    static setTask(taskStamp, prio) {
        if (taskStamp.taskType == C.TASKSTAMP_TASKTYPE_REALTIME) {
            Memory.taskArray[0][prio].push(taskStamp);
            /* TODO: Updata states (if needed) */
        } else {
            Memory.taskArray[1][prio].push(taskStamp);
            /* TODO: Updata states (if needed) */
        }
    }

    /*----------------------------------- Private Methods -----------------------------------*/

    /* AssignSpawnReq: process spawn request
       Input: none
       Return: none
    */
    static assignSpawnReq() {
        var cursor = 0;

        // Monitor the accepted tasks
        if (Memory.spawnQueue.accepted != 0) {
            for (var request of Memory.spawnQueue.accepted) {
                var spawn = Game.getObjectById(request.spawnID);

                // Check whether the spawn finished
                if (spawn.spawning == null) {
                    spawn.memory.busy = false;
                    Memory.newObject.push(request.creepName);
                    Memory.spawnQueue.accepted.splice(cursor, 1);
                }

                cursor += 1;
            }
        }

        // Loop through all spawns
        cursor = 0;

        if (Memory.spawnQueue.requested.length != 0) {
            for (var id of Memory.objectPool.spawn) {
                var spawn = Game.getObjectById(id);
    
                // Check whether the spawn is free
                if (spawn.spawning == null) {
                    var request = Memory.spawnQueue.requested[cursor];

                    if (request.type == C.WORKER) {
                        var name = request.type + Memory.statistics.creepWorkerNum;
                    } else {
                        var name = request.type + Memory.statistics.creepSoldierNum;
                    }

                    // Try to spawn, if success, move request from requested queue to accepted queue
                    // Otherwise, skip this reuqest for now
                    if (spawn.spawnCreep(request.body, name) == OK) {
                        if (request.type == C.WORKER) {
                            Memory.statistics.creepWorkerNum += 1;
                        } else {
                            Memory.statistics.creepSoldierNum += 1;
                        }
                        Memory.statistics.creepNum += 1;
                        spawn.memory.busy = true;
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
    }

    /* AssignTask: 
       - Assign one creep to one task by priority
       - Monitor the remaining life time of each creep
       - Handle pending, interrupt, restoring condition (for future version) 
       Input: none
       Return: none
    */
    static assignTask() {
        var cursor = [0, 0, 0];     // The position of *last* TaskStamp that has been iterated through + 1

        for (var id of Memory.objectPool.worker) {
            var creep = Game.getObjectById(id);

            // Monitor remaining life time
            if (creep.ticksToLive < 10) {
                /* TODO: deal with creep's death */
            }

            // Assign task to free creep
            if (!creep.memory.busy) {
                var find_flag = false;

                // Loop through real-time/dynamic array to find a task
                for (var i = cursor[0]; i < 2; i++) {
                    // Loop through each priority level
                    for (var j = cursor[1]; j < C.PLATO_LEN_TASKARRAY_REALTIME; j++) {
                        // Loop within each priority level
                        for (var k = cursor[2]; k < Memory.taskArray[i][j].length; k++) {
                            var taskStamp =  Memory.taskArray[i][j][k];

                            if (taskStamp.taskState == C.TASKSTAMP_TASKSTATE_INACTIVE) {
                                // Set flage and cursor
                                find_flag = true;
                                cursor = [0, j, k];
                                // Set taskStamp
                                taskStamp.id = id;
                                taskStamp.taskState = C.TASKSTAMP_TASKSTATE_ACTIVE;
                                // Set creep
                                creep.memory.taskCursor = cursor;
                                creep.memory.busy = true;
                                break;
                            } else if (taskStamp.taskState == C.TASKSTAMP_TASKSTATE_PENDING) {
                                /* TODO: deal with pending tasks */
                            } else {}
                        }

                        // If no task available in this level, reset cursor[2] and start new level
                        if (!find_flag) {
                            cursor[2] = 0;
                        } else {
                            break;  
                        }
                    }

                    // If no task available in real-time array, reset cursor[1] and start dynamic array
                    if (!find_flag) {
                        cursor[1] = 0;
                    } else {
                        break;
                    }
                }
                
                // If no task to do, stay free, but issue a warning to agents
                if (!find_flag) {
                    /* TODO */
                }
            }

            // Do current task, for assign a new task to it
            if (creep.memory.busy) {
                var taskStamp = Memory.taskArray[creep.memory.taskCursor[0]][creep.memory.taskCursor[1]][creep.memory.taskCursor[2]];
                var ret_flag;    // Return flage

                // Execute task
                if (creep.memory.role == C.WORKER) {
                    ret_flag = TaskStamp.execute(taskStamp, taskList_worker);
                } else if (creep.memory.role == C.SOLDIER) {
                    // ret_flag = TaskStamp.execute(taskStamp, taskList_soldier);
                } else {}

                // Handler different situtaion
                if (ret_flag == C.TASKHANDLER_ACTION_RET_FLG_TERMINATE) {    
                    // Terminate: release creep, delete task
                    creep.memory.busy = false;
                    creep.memory.taskCursor = null;
                    Memory.taskArray[creep.memory.taskCursor[0]][creep.memory.taskCursor[1]].splice(creep.memory.taskCursor[2], 1);
                } else if (ret_flag == C.TASKHANDLER_ACTION_RET_FLG_PEND) {
                    // Pend: release creep, keep task
                    creep.memory.busy = false;
                    creep.memory.taskCursor = null;
                    taskStamp.id = null;
                    taskStamp.taskState = C.TASKSTAMP_TASKSTATE_PENDING;
                } else if (ret_flag == C.TASKHANDLER_ACTION_RET_FLG_HALT) {
                    // Halt: release creep, delete task, may have to do some other things
                    /* TODO */
                } else {}
            } 
        }
    }

    /* Educate: set some attributes for new object, move them to corresponding lists
       Input: none
       Return: none
       Fields:
       - role: (string) C.WORKER/C.SOLDIER
       - busy: (boolean) whether the creep is working on a task
       - taskCursor: (list) [array (0 for real-time, 1 for dynamic), priority, index in the inner list]
    */
    static educate() {
        var cursor = 0;

        for (var objName of Memory.newObject) {
            if (objName[2] == 'a') {    // Spawn
                var obj = Game.spawns[objName];
                obj.memory.role = C.SPAWN;
                obj.memory.busy = false;
                obj.memory.taskCursor = null;
                Memory.objectPool.spawn.push(obj.id);
                Memory.statistics.spawnNum += 1;
            } else if (objName[2] == 'r') {     // Worker
                var obj = Game.creeps[objName];
                obj.memory.role = C.WORKER;
                obj.memory.busy = false;
                obj.memory.taskCursor = null;
                Memory.objectPool.worker.push(obj.id);
            } else if (objName[2] == 'l') {     // Soldier
                var obj = Game.creeps[objName];
                obj.memory.role = C.SOLDIER;
                obj.memory.busy = false;
                obj.memory.taskCursor = null;
                Memory.objectPool.soldier.push(obj.id);
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