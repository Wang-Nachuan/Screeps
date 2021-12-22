/* Name: plato.js
   Function: 
   - Prototype for all agents
   - Provides memory r/w API
   - Accept tasks; issus tasks based on resource production, consumption and prediction (provided by Demeter); maintain task queue
*/

const C = require("./constant");

class Plato {

    /* Update some records at the begining of each tick
       Input: none
       Return: none
    */
   static update() {
        // Update energy statistics
        for (var roomName in Memory.statistics.energy) {
            var data = Memory.statistics.energy[roomName];
            data.available = Game.rooms[roomName].energyAvailable - data.planned;
        }
    }

    /* Search within a priority level, insert the task to a propriate position
       Input: task, priority
       Return: cursor of task's position
    */
    static setTask(task, prio) {
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

    /* Delete a task in task queue or replace it with a null
       Input: task
       Return: none
    */
    static delTask(task) {
        var level = Memory.taskQueue[task.type][task.cursor[0]];
        var idx = task.cursor[1];
        
        if (idx == level.length - 1) {
            level.pop();
        } else {
            level[idx] = null;
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

            // Loop through each priority level
            for (var prio in queue) {
                var level = queue[prio];

                // Loop within each priority level
                for (var idx in level) {
                    var task = level[idx]
                    var data = Memory.statistics.energy[task.room];

                    if (task.energy <= data.available) {
                        // Add to task queue if energy consumption is acceptable
                        this.setTask(task, prio);
                        // Delet the corresponding task in proposed queue
                        level.splice(idx, 1);
                        // Lock the required amount of energy
                        data.available -= task.energy;
                        data.planned += task.energy;
                    }
                }
            }             
        }
    }

    /* Propose a task
       Input: task, priority
       Return: none
    */
    static propTask(task, prio) {
        Memory.propTaskQueue[task.type][prio].push(task);
    }

    /* ...
       Input:
       Return:
    */
}

module.exports = Plato;