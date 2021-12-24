const C = require("./constant");
const Task = require("./task");
const handlers_spawn = require("./handlers.spawn");
const handlers_worker = require("./handlers.worker");

class Plato {

    static init() {
        // Initialize memory when run at the first time
        if (Memory.initFlag == 0) {

            Memory.initFlag = 1;
            
            // Task array
            Memory.taskArray = {
                spawn: {realTime: Array(C.PLATO_LEN_TASKARRAY_REALTIME), dynamic: Array(C.PLATO_LEN_TASKARRAY_DYNAMIC)},
                soldier: {realTime: Array(C.PLATO_LEN_TASKARRAY_REALTIME), dynamic: Array(C.PLATO_LEN_TASKARRAY_DYNAMIC)},
                worker: {realTime: Array(C.PLATO_LEN_TASKARRAY_REALTIME), dynamic: Array(C.PLATO_LEN_TASKARRAY_DYNAMIC)}
            };
            for (var i of ['spawn', 'soldier', 'worker']) {
                for (var j = 0; j < C.PLATO_LEN_TASKARRAY_REALTIME; j++) {
                    Memory.taskArray[i].realTime[j] = [];
                }
                for (var j = 0; j < C.PLATO_LEN_TASKARRAY_DYNAMIC; j++) {
                    Memory.taskArray[i].dynamic[j] = [];
                }
            }

            // ID pools of all objects
            Memory.objectPool = {spawn: [], soldier: [], worker: []};
            Memory.objectPool.spawn.push(Game.spawns['Spawn0'].id);
            Game.spawns['Spawn0'].memory.role = C.SPAWN;
            Game.spawns['Spawn0'].memory.busy = false;
            Game.spawns['Spawn0'].memory.taskCursor = null;

            // Name of owned rooms
            Memory.ownRooms = [];
            for (var room in Game.rooms) {
                Memory.ownRooms.push(room);
            }
            
            // Statistics
            Memory.statistics = {spawnNum: 1, creepNum: 0, creepWorkerNum: 0, creepSoldierNum: 0};

            // Set memory space for agents
            Memory.agents = {};
        }
    }

    /* Routine: routine function that run at the begining of each tick
       Input: none
       Return: none
    */
    static routine() {
        this.assignTask();
    }

    /*----------------------------------- Public Methods -----------------------------------*/

    /* SetTask: add a task stamp to the task array, update some states accordingly
       Input
       - task
       - prio: priority of task (0-C.PLATO_LEN_TASKARRAY_REALTIME/DYNAMIC-1, smaller means higher priority)
       Return: none
       * Note: users should check for themselves the right condition to issue a specific task
    */
    static setTask(task, prio) {
        if (task.taskType == C.TASK_TYPE_REALTIME) {
            Memory.taskArray[task.taskPerformer].realTime[prio].push(task);
            /* TODO: Updata variables (if needed) */
        } else {
            Memory.taskArray[task.taskPerformer].dynamic[prio].push(task);
            /* TODO: Updata variables (if needed) */
        }
    }

    /*----------------------------------- Private Methods -----------------------------------*/

    /* AssignTask: 
       - Assign one creep to one task by priority
       - Monitor the remaining life time of each creep
       - Handle pending, interrupt, restoring condition (for future version) 
       Input: none
       Return: none
    */
    static assignTask() {

        // Loop through task arrays for all kinds of objects
        for (var objType in Memory.taskArray) {
            var taskArray = Memory.taskArray[objType];      // Shortcut
            var cursor = ['realTime', 0, 0];     // The position of *last* task that has been iterated through + 1

            for (var id of Memory.objectPool[objType]) {
                var obj = Game.getObjectById(id);

                // If it is a creep, monitor remaining life time
                if (obj.role == C.WORKER || obj.role == C.SOLDIER) {
                    if (obj.ticksToLive < 10) {
                        /* TODO: deal with creep's death */
                    }
                }

                // Assign task to free obj
                if (!obj.memory.busy) {
                    var find_flag = false;

                    // Loop through real-time/dynamic array to find a task
                    for (var arrType in taskArray) {
                        // Loop through each priority level
                        for (var j = cursor[1]; j < C.PLATO_LEN_TASKARRAY_REALTIME; j++) {
                            // Loop within each priority level
                            for (var k = cursor[2]; k < taskArray[arrType][j].length; k++) {
                                var task =  taskArray[arrType][j][k];

                                if (task.taskState == C.TASK_STATE_INACTIVE) {
                                    // Set flage and cursor
                                    find_flag = true;
                                    cursor = [arrType, j, k];
                                    // Set task
                                    task.id = id;
                                    task.taskState = C.TASK_STATE_ACTIVE;
                                    // Set obj
                                    obj.memory.taskCursor = cursor;
                                    obj.memory.busy = true;
                                    break;
                                } else if (task.taskState == C.TASK_STATE_PENDING) {
                                    /* TODO: handle pending situation */
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
                if (obj.memory.busy) {
                    var task = taskArray[obj.memory.taskCursor[0]][obj.memory.taskCursor[1]][obj.memory.taskCursor[2]];
                    var ret_flag;    // Returned flage

                    // Execute task
                    switch (obj.memory.role) {
                        case C.SPAWN:
                            ret_flag = Task.execute(task, handlers_spawn);
                            break;
                        case C.SOLDIER:
                            // ret_flag = Task.execute(task, taskList_soldier);
                            break;
                        case C.WORKER:
                            ret_flag = Task.execute(task, handlers_worker);
                            break;
                    }

                    // Response to different flages
                    if (ret_flag == C.TASKHANDLER_PHASE_RET_FLG_TERMINATE) {    
                        // Terminate: release obj, delete task
                        taskArray[obj.memory.taskCursor[0]][obj.memory.taskCursor[1]].splice(obj.memory.taskCursor[2], 1);
                        obj.memory.busy = false;
                        obj.memory.taskCursor = null;
                    } else if (ret_flag == C.TASKHANDLER_PHASE_RET_FLG_PEND) {
                        // Pend: release obj, keep task
                        obj.memory.busy = false;
                        obj.memory.taskCursor = null;
                        task.id = null;
                        task.taskState = C.TASK_STATE_PENDING;
                    } else if (ret_flag == C.TASKHANDLER_PHASE_RET_FLG_HALT) {
                        // Halt: release obj, delete task, may have to do some other things
                        /* TODO */
                    } else {}
                } 
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
                Memory.objectPool.spawn.push(obj.id);
                Memory.statistics.spawnNum += 1;
            } else if (objName[2] == 'r') {     // Worker
                var obj = Game.creeps[objName];
                obj.memory.role = C.WORKER;    
                Memory.objectPool.worker.push(obj.id);
            } else if (objName[2] == 'l') {     // Soldier
                var obj = Game.creeps[objName];
                obj.memory.role = C.SOLDIER;
                Memory.objectPool.soldier.push(obj.id);
            } else {}

            // Common attributes
            obj.memory.busy = false;
            obj.memory.taskCursor = null;

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