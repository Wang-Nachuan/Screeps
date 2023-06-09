/* Name: agent.euclid.js
   Function: 
   - Scheduling tasks based on priority and distance
*/

const Plato = require('./plato');
const Task = require('./class.task');
const Node = require('./class.node');
const C = require('./constant');
const tasks_worker = require('./task.worker');

class Euclid extends Plato {

    /* Wrapper function run in the main loop
       Input: none
       Return: none
    */
    static wrapper() {
        // Order matters
        this.issueSpawnReq();
        this.issueTask();
        this.scheSpawnReq();
        this.scheTask();
        this.issueConstructReq();
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

    /* Search within a priority level, insert the task to a propriate position
       Input: task, priority level
       Return: none
    */
    static setTask(task, level) {
        for (var idx in level) {
            if (level[idx] == null) {
                level[idx] = task;
                return;
            }
        }
        // If no empty space, add task at the end
        level.push(task);
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

    /* Update the standard body part of creep
       Input: none
       Return: none
    */
    static updateStdBody(roomName) {
        var capa = Game.rooms[roomName].energyCapacityAvailable;
        var n = Math.floor(capa / 200);     // Number of [WORK, CARRY, MOVE] pairs
        var ex_en = capa % 200;             // Extra energy

        // Worker size limite
        if (n > 6) {
            n = 6;
            ex_en = 0;
        }

        var body = [];
        var count_move = n;
        var count_work = n;
        var count_carry = n;
        

        for (var i = 0; i < n; i++) {
            body = body.concat([WORK, CARRY, MOVE]);
        }

        if (ex_en >= 50 && ex_en < 100) {
            body = body.concat([MOVE]);
            count_move += 1;
        } else if (ex_en >= 100 && ex_en < 150) {
            body = body.concat([CARRY, MOVE]);
            count_move += 1;
            count_carry += 1;
        } else {
            body = body.concat([WORK, MOVE]);
            count_move += 1;
            count_work += 1
        }

        Memory.statistics.stdBody[roomName].worker = body;
        Memory.statistics.stdBody[roomName].countWorker.move = count_move;
        Memory.statistics.stdBody[roomName].countWorker.work = count_work;
        Memory.statistics.stdBody[roomName].countWorker.carry = count_carry;

    }

    /* Issue proposed tasks based on energy consumption and priority
       Input: none
       Return: none
    */
    static issueTask() {
        // Loop through queues
        for (var type in Memory.propTaskQueue) {
            var queue = Memory.propTaskQueue[type];

            // Loop through all priority levels
            for (var prio in queue) {
                var level = queue[prio];

                // Loop within each priority level
                for (var idx in level) {
                    var task = level[idx]
                    var data = Memory.statistics.energy[task.room];

                    if (task.energy == 0) {
                        this.setTask(task, Memory.taskQueue[type][prio]);
                        task.state = C.TASK_STATE_ISSUED;
                        level.splice(idx, 1);
                    } else if (task.energy <= data.available) {
                        this.setTask(task, Memory.taskQueue[type][prio]);
                        task.state = C.TASK_STATE_ISSUED;
                        level.splice(idx, 1);
                        // Pin the required amount of energy
                        data.available -= task.energy;
                        data.pinned += task.energy;
                    } else {}
                }
            }
        }
    }

    /* Issue proposed spawn requests based on energy consumption and priority
       Input: none
       Return: none
    */
    static issueSpawnReq() {
        // Loop through all priority levels
        for (var prio in Memory.spawnQueue.prop) {
            var level = Memory.spawnQueue.prop[prio];

            // Loop through all requests
            for (var idx in level) {
                var req = level[idx];
                var data = Memory.statistics.energy[req.room];

                if (req.energy <= data.available) {
                    this.setTask(req, Memory.spawnQueue.sche[prio]);
                    req.state = C.TASK_STATE_ISSUED;
                    level.splice(idx, 1);
                    data.available -= req.energy;
                    data.pinned += req.energy;
                }
            }
        }
    }

    /* Add all construction site to queue, propose construction tasks
       Input: none
       Return: none
    */
    static issueConstructReq() {
        // Find all maually set construction site
        for (var id in Game.constructionSites) {
            var find_flage = Memory.constructQueue.prop.includes(id);
            if (!find_flage) {
                for (var node of Memory.constructQueue.sche) {
                    if (node.id == id) {
                        find_flage = true;
                        break;
                    }
                }
                if (!find_flage) {
                    Memory.constructQueue.prop.push(id);
                }
            }
        }

        // Move sites to scheduled queue
        for (var id of Memory.constructQueue.prop) {
            var site = Game.getObjectById(id);
            var node = new Node(site.pos, site.structureType, id);
            Memory.constructQueue.sche.push(node);
        }
        Memory.constructQueue.prop = [];

        // Clean the scheduled queue
        var count = {};
        for (var i in Memory.constructQueue.sche) {
            var node = Memory.constructQueue.sche[i];
            var site = Game.getObjectById(node.id)
            if (null == site) {
                // Add new structure (if any) to the pool
                var found = Game.rooms[node.pos.roomName].lookForAt(LOOK_STRUCTURES, node.pos.x, node.pos.y);
                if (found.length > 0) {
                    var struct = found[0];
                    var node_struct = new Node(struct.pos, struct.structureType, struct.id);
                    Memory.nodePool[node.pos.roomName][struct.structureType].push(node_struct);
                    // If new structure is extension, update standard boy
                    if (struct.structureType == STRUCTURE_EXTENSION) {
                        this.updateStdBody(node.pos.roomName);
                    }
                }
                Memory.constructQueue.sche.splice(i, 1);
            } else {
                if (!count[site.room.name]) {
                    count[site.room.name] = 1;
                } else {
                    count[site.room.name] += 1;
                }
            }
        }

        // Propose task based on the number of sites and worker's body part
        for (var room in count) {
            var target_numTask = 0;

            // Calculate target number of tasks
            for (var queue of Memory.proQueue) {
                for (var process of queue) {
                    if (process != null && process.room == room) {
                        target_numTask = process.realNum.worker - 2;
                    }
                }
            }

            if (!Memory.constructQueue.numTask[room]) {
                Memory.constructQueue.numTask[room] = 0;
            }

            if (Memory.constructQueue.numTask[room] < target_numTask) {
                var fromNode = new Node({x: 0, y: 0, roomName: room}, 'source', null, true, 'source');
                var toNode = new Node({x: 0, y: 0, roomName: room}, 'constructionSite', null, true, 'constructSite');
                for (var i = 0; i < target_numTask - Memory.constructQueue.numTask[room]; i++) {
                    this.propTask(tasks_worker.buildStruct(fromNode, toNode, 0, room), C.PRIO_BUILD);
                }
                Memory.constructQueue.numTask[room] = target_numTask;
            }
        }
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
                if (creep.ticksToLive <= 3) {
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
                            // Give pinned but unused energy back (virtually)
                            if (task.room != null) {Memory.statistics.energy[task.room].pinned -= (task.energy - task.energyAcq);}
                            break;
                        case C.TASK_OP_RET_FLG_HALT:
                            this.sendMsg([task.token, C.MSG_TASK_HALT]);
                            this.delTask(Memory.taskQueue[creep.taskCursor[0]][creep.taskCursor[1]], creep.taskCursor[2]);
                            creep.isBusy = false;
                            creep.taskCursor = null;
                            // Give pinned but unused energy back (virtually)
                            if (task.room != null) {Memory.statistics.energy[task.room].pinned -= (task.energy - task.energyAcq);}
                            /* TODO: inform agents if needed */
                            break;
                    }
                }

                // Update creep's state at the end of execution
                creep.lastTickEn = creep.store[RESOURCE_ENERGY];
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