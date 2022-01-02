/* Name: agent.euclid.js
   Function: 
   - Scheduling tasks based on priority and distance
*/

const Plato = require('./plato');
const Task = require('./task');
const Node = require('./node');
const C = require('./constant');

class Euclid extends Plato {

    /* Wrapper function run in the main loop
       Input: none
       Return: none
    */
    static wrapper() {
        this.scheSpawnReq();
        this.scheTask();
    }

    /* Delete a task in a given level or replace it with a null
       Input: type, priority level, index witin the level
       Return: none
    */
    static delTask(level, idx) {
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
    static cost(task, creep) {
        var startIdx = Task.startIdx(task, creep);
        var startNode = task.nodes[startIdx];
        var cost = creep.pos.getRangeTo(Node.pos(startNode));
        return [cost, startIdx];
    }

    /* Let creep suicide, update memory and task, return ordered but unused energy, notify agent
       Input: creep object
       Output: none
    */
    static buryCreep(creep) {
        var id = creep.id;
        var name = creep.name;
        var pool = Memory.creepPool[creep.role];
        var task = Memory.taskQueue[creep.taskCursor[0]][creep.taskCursor[1]][creep.taskCursor[2]];
        var node = task.nodes[task.cursor];
        var process = this.getProcess(creep.token);

        // Delete id from creep pool
        pool.splice(pool.indexOf(id), 1);

        // Update statisics
        Memory.statistics.creep[creep.role] -= 1;

        // Update process
        process.realNum[creep.role] -= 1;

        // Updat node attachment
        var pool = Memory.nodePool[node.pos.roomName][node.type];
        if (pool != undefined) {
            for (var i of pool) {
                if (i.id == node.id) {
                    var idx = i.attach.indexOf(creep.id);
                    if (idx != -1) {i.attach.splice(idx, 1);}
                    break;
                }
            }
        }

        // Update task state
        task.cursor = null;
        task.ownerId = null;
        task.isMoving = false;
        if (task.room != null) {
            task.state = C.TASK_STATE_PENDED;
        } else {
            task.state = C.TASK_STATE_ISSUED;
        }

        // Notify agnent
        var msg;
        switch (task.type) {
            case C.WORKER:
                msg = [C.TOKEN_HEADER_DEMETER, C.MSG_CREEP_DEATH, [creep.type, creep.process]];
                break;
        }
        this.sendMsg(msg);

        // Let creep suicide, free memory 
        creep.suicide();
        delete Memory.creeps[name];
    }

    /* Assign each creep with a task
       Input: none
       Return: none
    */
    static scheTask() {
        // Loop through all types of creep
        for (var type in Memory.taskQueue) {
            var queue = Memory.taskQueue[type];

            // Loop through all creeps in the ID pool
            for (var id of Memory.creepPool[type]) {
                var creep = Game.getObjectById(id);
                var termi_flag = false;     // Flage of terminating loops

                // Monitor the life condition of creep
                if (creep.ticksToLive <= 5) {
                    this.buryCreep(creep);
                    break;
                }

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

                            // Skip empty location
                            if (task == null) {continue;}

                            // If task is pended, try to claim the lost energy for this task
                            if (task.state == C.TASK_STATE_PENDED) {
                                if (this.claimEnergy(task.room, task.energyStore)) {
                                    task.energy += task.energyStore;
                                    task.energyStore = 0;
                                    task.state = C.TASK_STATE_ISSUED;
                                }
                            }

                            // Compare and find the task with smaller cost
                            if (task.state == C.TASK_STATE_ISSUED) {
                                var ret = this.cost(task, creep);

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
                            /* Not specified yet */
                            break;
                        case C.TASK_OP_RET_FLG_TERMINATE:
                            this.sendMsg([task.token, C.MSG_TASK_TERMINATE]);
                            this.delTask(Memory.taskQueue[creep.taskCursor[0]][creep.taskCursor[1]], creep.taskCursor[2]);
                            creep.isBusy = false;
                            creep.taskCursor = null;
                            // Give ordered but unused energy back
                            if (task.room != null) {Memory.statistics.energy[task.room].pinned -= (task.energy - task.energyAcq);}
                            break;
                        case C.TASK_OP_RET_FLG_HALT:
                            this.sendMsg([task.token, C.MSG_TASK_HALT]);
                            this.delTask(Memory.taskQueue[creep.taskCursor[0]][creep.taskCursor[1]], creep.taskCursor[2]);
                            creep.isBusy = false;
                            creep.taskCursor = null;
                            // Give ordered but unused energy back
                            if (task.room != null) {Memory.statistics.energy[task.room].pinned -= (task.energy - task.energyAcq);}
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
    static scheSpawnReq() {
        // Loop through all rooms
        for (var room in Memory.nodePool) {
            // Loop through all spawns
            for (var node of Memory.nodePool[room].spawn) {
                var spawn = Game.getObjectById(node.id);

                // Execute the request for each spawn
                if (spawn.isBusy) {
                    // Monitor the spawning process
                    if (spawn.spawning == null) {
                        var level = Memory.spawnQueue.sche[spawn.taskCursor[0]];
                        var idx = spawn.taskCursor[1];
                        var req = level[idx];
                        var creep = Game.creeps[req.name];
                        // Set attributes
                        creep.role = req.type;
                        creep.process = req.token;
                        // Add creep to the pool
                        Memory.creepPool[req.type].push(creep.id);
                        // Delete task, free spawn
                        this.delTask(level, idx);
                        spawn.isBusy = false;
                        spawn.taskCursor = null;
                    }
                }

                // If spawn has no request, find a request
                if (!spawn.isBusy) {
                    // Loop through all priority levels
                    for (var prio in Memory.spawnQueue.sche) {
                        var level = Memory.spawnQueue.sche[prio];

                        // Loop through all request
                        for (var idx in level) {
                            var req = level[idx];

                            if (req == null) {continue;}
                            
                            if (req.state == C.TASK_STATE_ISSUED && req.room == spawn.room.name) {
                                req.state = C.TASK_STATE_SCHEDULED;
                                spawn.isBusy = true;
                                spawn.taskCursor = [prio, idx];
                                // Start spawning
                                spawn.spawnCreep(req.body, req.name);
                                // Consume the pinned energy
                                Memory.statistics.energy[req.room].pinned -= req.energy;
                            }
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

module.exports = Euclid;