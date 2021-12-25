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
    static propSpawnReq(type, room, body, prio) {
        var energy = 0;     // Energy required to spawn the creep

        // Update statistic
        Memory.statistics.creep[type] += 1;
        var name = type[0] + Memory.statistics.creep[type];

        // Calculate energy consumption
        for (var part of body) {energy += BODYPART_COST[part];}

        // Set request
        var req = {
            name: name, 
            type: type, 
            room: room, 
            body: body, 
            energy: energy,
            state: C.TASK_STATE_PROPOSED
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

    /*-------------------- Private Methods --------------------*/

    /* Search within a priority level, insert the task to a propriate position
       Input: task, priority
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

        // Generate construction task
        for (var i in Memory.constructQueue.prop) {
            // Propose task
            var site = Game.getObjectById(Memory.constructQueue.prop[i]);
            var fromNode = Memory.nodePool.source[0];
            var toNode = new Node(site.pos, 'constructionSites', site.id);
            this.propTask(tasks_worker.buildStruct(fromNode, toNode), 4);

            // Move to schedules queue
            Memory.constructQueue.sche.push(Memory.constructQueue.prop[i]);
            Memory.constructQueue.prop.splice(i, 1);

            /* TODO: Propose two version of tasks (using source energy/using stored energy) */
        }

        // Clean the scheduled queue
        for (var i in Memory.constructQueue.sche) {
            if (null == Game.getObjectById(Memory.constructQueue.sche[i])) {
                Memory.constructQueue.sche.splice(i, 1);
            }
        }
    }

    /* ...
       Input:
       Return:
    */
}

module.exports = Plato;