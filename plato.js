/* Name: plato.js
   Function: 
   - Prototype for all agents
   - Issue tasks based on energy consumption
   - Grant energy usage of structures
   - (Future) Manage energy consumptioin based on prediction and warfare, i.e. energy deficit & tilt
*/

const C = require("./constant");

class Plato {

    /* Propose a task
       Input: task, priority
       Return: none
    */
    static propTask(task, prio) {
        Memory.propTaskQueue[task.type][prio].push(task);
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
        this.#issueTask();
    }

    /* Search within a priority level, insert the task to a propriate position
       Input: task, priority
       Return: cursor of task's position
    */
    static #setTask(task, prio) {
       var level = Memory.taskQueue[task.type][prio];
       var cursor = 0;

        for (var pos of level) {
            if (pos == null) {
                level[cursor] = task;
                return [prio, cursor];
            }
            cursor += 1;
        }

        // If no empty space, add task at the end
        level.push(task);
        return [prio, cursor];
    }

    /* Issue proposed tasks based on energy consumption and priority
       Input: none
       Return: none
    */
    static #issueTask() {
        // Loop through queues
        for (var type in Memory.propTaskQueue) {
            var queue = Memory.propTaskQueue[type];

            // Loop through each priority level
            for (var prio in queue) {
                var level = queue[prio];

                // Loop within each priority level
                for (var idx in level) {
                    var task = level[idx]
                    var data = Memory.statistics.energy[task.room];

                    if (task.energy <= data.available) {
                        // Add to task queue if energy consumption is acceptable
                        this.#setTask(task, prio);
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

    

    /* ...
       Input:
       Return:
    */
}

module.exports = Plato;