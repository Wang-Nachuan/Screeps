/* Name: plato.js
   Function: 
   - Prototype for all agents
   - Issue tasks based on energy consumption
   - Grant energy usage of structures
   - (Future) Manage energy consumptioin based on prediction and warfare, i.e. energy deficit & tilt
*/

const C = require('./constant');

class Plato {

    /*-------------------- Public Methods --------------------*/

    /* Propose a task
       Input: task, priority
       Return: none
    */
    static propTask(task, prio) {
        Memory.propTaskQueue[task.type][prio].push(task);
        console.log('[1]');
    }

    /* Propose a spawn request
       Input: creep name, type, room to spawn, body parts, priority
       Return: none
    */
    static propSpawnReq(name, type, room, body, prio) {
        var energy = 0;     // Energy required to spawn the creep

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
        this._issueSpawnReq();
        this._issueTask();
    }

    /*-------------------- Private Methods --------------------*/

    /* Search within a priority level, insert the task to a propriate position
       Input: task, priority
       Return: none
    */
    static _setTask(task, level) {
        task.state = C.TASK_STATE_ISSUED;
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
    static _issueTask() {
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

                    if (task.energy <= data.available) {
                        // Add to task queue if energy consumption is acceptable
                        this._setTask(task, Memory.TaskQueue[type][prio]);
                        // Delet the corresponding task in proposed queue
                        level.splice(idx, 1);
                        // Pin the required amount of energy
                        data.available -= task.energy;
                        data.pinned += task.energy;
                    }
                }
            }
        }
    }

    /* Issue proposed spawn requests based on energy consumption and priority
       Input: none
       Return: none
    */
    static _issueSpawnReq() {
        // Loop through all priority levels
        for (var prio in Memory.spawnQueue.prop) {
            var level = Memory.spawnQueue.prop[prio];

            // Loop through all requests
            for (var idx in level) {
                var req = level[idx];
                var data = Memory.statistics.energy[req.room];

                if (req.energy <= data.available) {
                    this._setTask(req, Memory.spawnQueue.sche[prio]);
                    level.splice(idx, 1);
                    data.available -= req.energy;
                    data.pinned += req.energy;
                }
            }
        }
    }

    /* ...
       Input:
       Return:
    */
}

module.exports = Plato;