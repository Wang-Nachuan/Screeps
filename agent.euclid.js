/* Name: agent.euclid.js
   Function: 
   - Scheduling tasks based on priority and distance
*/

const Plato = require('./plato');
const Task = require('./task');
const Node = require('./node');
const C = require('./constant');

class Euclid extends Plato {

    /*-------------------- Public Methods --------------------*/

    /* Wrapper function run in the main loop
       Input: none
       Return: none
    */
    static wrapper() {
        this._scheSpawnReq();
        this._scheTask();
    }

    /*-------------------- Private Methods --------------------*/

    /* Delete a task in a given level or replace it with a null
       Input: type, priority level, index witin the level
       Return: none
    */
    static _delTask(level, idx) {
        if (idx == level.length - 1) {
            level.pop();
        } else {
            level[idx] = null;
        }
    }

    /* Calculate the movement cost of taking a task
        Input: task, object
        Output: int cost, starting index
    */
    static _cost(task, creep) {
        var startIdx = Task.startIdx(task, creep);
        var startNode = task.nodes[startIdx];
        var cost = creep.pos.getDirectionTo(Node.pos(startNode));
        return [cost, startIdx];
    }


    /* Assign each creep with a task
       Input: none
       Return: none
    */
    static _scheTask() {
        // Loop through all types of creep
        for (var type in Memory.taskQueue) {
            var queue = Memory.taskQueue[type];

            // Loop through all creeps in the ID pool
            for (var id of Memory.idPool[type]) {
                var creep = Game.getObjectById(id);
                var termi_flag = false;     // Flage of terminating loops

                // If creep has no task, find a task
                if (!creep.isBusy) {

                    // Loop through all priority levels
                    for (var prio in Memory.taskQueue[type]) {
                        var level = queue[prio];
                        var minCost = Infinity;
                        var startIdx, cursor;

                        // Loop through all tasks, find the task with minimal cost
                        for (var i in level) {
                            var task = level[i];

                            if (task.state == C.TASK_STATE_ISSUED) {
                                var ret = this._cost(task, creep);

                                if (ret[0] < minCost) {
                                    minCost = ret[0];
                                    startIdx = ret[1];
                                    cursor = [type, prio, i];
                                    termi_flag = true;
                                }
                            }
                        }

                        // Assign task to creep
                        if (termi_flag) {
                            var task = level[cursor[2]];
                            // Set task's parameters
                            task.cursor = startIdx;
                            task.ownerId = creep.id;
                            task.state = C.TASK_STATE_SCHEDULED;
                            task.isMoving = true;
                            // Set creep's parameters
                            creep.taskCursor = cursor;
                            creep.isBusy = true;
                            break;
                        }
                    }
                }

                // Execute the task
                if (creep.isBusy) {
                    var task = Memory.taskQueue[creep.taskCursor[0]][creep.taskCursor[1]][creep.taskCursor[2]];
                    var ret_flag = Task.execute(task);

                    switch (ret_flag) {
                        case C.TASK_OP_RET_FLG_OCCUPY:
                            // Do nothing
                            break;
                        case C.TASK_OP_RET_FLG_FINISH:
                            // Do nothing
                            break;
                        case C.TASK_OP_RET_FLG_PEND:
                            task.ownerId = null;
                            task.state = C.TASK_STATE_PENDED;
                            creep.isBusy = false;
                            creep.taskCursor = null;
                            /* TODO: inform agents if needed */
                            break;
                        case C.TASK_OP_RET_FLG_TERMINATE:
                            this._delTask(Memory.taskQueue[creep.taskCursor[0]][creep.taskCursor[1]], creep.taskCursor[2]);
                            creep.isBusy = false;
                            creep.taskCursor = null;
                            break;
                        case C.TASK_OP_RET_FLG_HALT:
                            this._delTask(Memory.taskQueue[creep.taskCursor[0]][creep.taskCursor[1]], creep.taskCursor[2]);
                            creep.isBusy = false;
                            creep.taskCursor = null;
                            /* TODO: inform agents if needed */
                            break;
                    }
                }
            }
        }
    }

    /* Assign each spawn with a spawn request 
       Input: none
       Return: none
    */
    static _scheSpawnReq() {
        // Loop through all spawns
        for (var id of Memory.idPool.spawn) {
            var spawn = Game.getObjectById(id);

            // Execute the request for each spawn
            if (spawn.isBusy) {
                // Monitor the spawning process
                if (spawn.spawning == null) {
                    this._delTask(Memory.spawnQueue.sche[spawn.taskCursor[0]], spawn.taskCursor[1]);
                    spawn.isBusy = true;
                    spawn.taskCursor = [prio, idx];
                }
            }

            // If spawn has no request, find a request
            if (!spawn.isBusy) {
                // Loop through all priority levels
                for (var prio in  Memory.spawnQueue.sche) {
                    var level = Memory.spawnQueue.sche[prio];

                    // Loop through all request
                    for (var idx in level) {
                        var req = level[idx];
                        
                        if (req.state == C.TASK_STATE_ISSUED && req.room == spawn.room.name) {
                            req.state = C.TASK_STATE_SCHEDULED;
                            spawn.isBusy = true;
                            spawn.taskCursor = [prio, idx];
                            // Start spawning
                            spawn.spawnCreep(req.body, req.name);
                        }
                    }
                }
            }
        }
    }

    /* ...
       Input:
       Return:
    */
}