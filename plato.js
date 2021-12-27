/* Name: plato.js
   Function: 
   - Prototype for all agents
   - Issue tasks based on energy consumption
   - Grant energy usage of structures
   - Maintain task/spawn/construct queue
   - (Future) Manage energy consumptioin based on prediction and warfare, i.e. energy deficit & tilt
*/

const tasks_worker = require('./task.worker');
const Node = require('./node');
const C = require('./constant');

class Plato {

    /* Wrapper function run in the main loop
       Input: none
       Return: none
    */
       static wrapper() {
        // Order matters
        this.issueSpawnReq();
        this.issueConstructReq();
        this.issueTask();
    }

    /*-------------------- Public Methods --------------------*/

    /* Propose a task
       Input: task, priority
       Return: none
    */
    static propTask(task, prio) {
        Memory.propTaskQueue[task.type][prio].push(task);
    }

    /* Propose a spawn request
       Input: creep name, type, room to spawn, body parts, priority
       Return: none
    */
    static propSpawnReq(type, room, prio, body=null, token=null) {
        var energy = 0;     // Energy required to spawn the creep
        var body_real;

        if (body == null) {
            body_real = Memory.statistics.stdBody[room][type];
        } else {
            body_real = body;
        }

        // Update statistic
        Memory.statistics.creep[type] += 1;
        var name = type[0] + (Memory.statistics.creep[type] % 1000);

        // Calculate energy consumption
        for (var part of body_real) {energy += BODYPART_COST[part];}

        // Set request
        var req = {
            name: name, 
            type: type, 
            room: room, 
            body: body_real, 
            energy: energy,
            state: C.TASK_STATE_PROPOSED,
            token: token
        };
        Memory.spawnQueue.prop[prio].push(req);
    }

    /* Propose a construction request
       Input: id
       Return: none
    */
    static propConstructReq(id) {
        Memory.constructQueue.push(id);
    }

    /* Claim some amount of energy
       Input: room, energy
       Return: true if granted, fale otherwise
    */
    static claimEnergy(room, energy) {
        var data = Memory.statistics.energy[room];

        if (energy <= data.available) {
            data.available -= energy;
            data.pinned += energy;
            return true;
        } else {
            return false;
        }
    }

    /* Send message to a agent's message queue
       Input: message [token, message type, additional information (option)]
       Return: 
    */
    static sendMsg(msg) {
        // Check validity
        if (msg[0] == null) {
            return;
        }
        // Deliver message
        switch (msg[0] & 0xF000) {
            case C.TOKEN_HEADER_DEMETER:
                Memory.agents.demeter.msgQueue.push(msg);
                break;
            default:
                break;
        }
    }

    /*-------------------- Private Methods --------------------*/

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

    /* Update the standard body part of creep
       Input: none
       Return: none
    */
    static updateStdBody() {
        for (var name of Memory.rooms.haveSpawn) {
            var capa = Game.rooms[name].energyCapacityAvailable;
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
                body.concat([WORK, CARRY, MOVE]);
            }

            if (ex_en >= 50 && ex_en < 100) {
                body.concat([MOVE]);
                count_move += 1;
            } else if (ex_en >= 100 && ex_en < 150) {
                body.concat([CARRY, MOVE]);
                count_move += 1;
                count_carry += 1;
            } else {
                body.concat([WORK, MOVE]);
                count_move += 1;
                count_work += 1
            }

            Memory.statistics.stdBody[name].worker = body;
            Memory.statistics.stdBody[name].countWorker.move = count_move;
            Memory.statistics.stdBody[name].countWorker.work = count_work;
            Memory.statistics.stdBody[name].countWorker.carry = count_carry;
        }
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

    /* Add all manually set construction site to queue, propose construction tasks
       Input: none
       Return: none
    */
    static issueConstructReq() {
        // Find all maually set construction site
        for (var id in Game.constructionSites) {
            if ((!Memory.constructQueue.prop.includes(id)) && (!Memory.constructQueue.sche.includes(id))) {
                Memory.constructQueue.prop.push(id);
            }
        }

        // Move sites to scheduled queue
        for (var id of Memory.constructQueue.prop) {
            Memory.constructQueue.sche.push(id);
        }
        Memory.constructQueue.prop = [];

        // Clean the scheduled queue
        var sum_energy = {};
        for (var i in Memory.constructQueue.sche) {
            var site = Game.getObjectById(Memory.constructQueue.sche[i])
            if (null == site) {
                Memory.constructQueue.sche.splice(i, 1);
            } else {
                if (!sum_energy[site.room.name]) {
                    sum_energy[site.room.name] = site.progressTotal;
                } else {
                    sum_energy[site.room.name] += site.progressTotal;
                }
            }
        }

        // Propose task based on the number of sites and worker's body part
        for (var name in sum_energy) {
            var bodyCount = Memory.statistics.stdBody[name].countWorker;
            var target_numTask = Math.floor(sum_energy[name] / bodyCount.carry / 50 / 6);

            if (!Memory.constructQueue.numTask[name]) {
                Memory.constructQueue.numTask[name] = 0;
            }

            if (Memory.constructQueue.numTask[name] < target_numTask) {
                var fromNode = new Node({x: 0, y: 0, roomName: name}, 'source', null, true, 'source');
                var toNode = new Node({x: 0, y: 0, roomName: name}, 'constructionSite', null, true, 'constructSite');
                for (var i = 0; i < target_numTask - Memory.constructQueue.numTask[name]; i++) {
                    this.propTask(tasks_worker.buildStruct(fromNode, toNode, 0, name), 4);
                }
                Memory.constructQueue.numTask[name] = target_numTask;
            }
        }
    }

    /* ...
       Input:
       Return:
    */
}

module.exports = Plato;