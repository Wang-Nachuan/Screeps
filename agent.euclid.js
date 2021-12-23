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
        
    }

    /*-------------------- Private Methods --------------------*/

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

    /* Calculate the movement cost of taking a task
        Input: task, object
        Output: int cost, starting index
    */
    static cost(task, creep) {
        var startIdx = Task.startIdx(task, creep);
        var startNode = task.nodes[startIdx];
        var cost = creep.pos.getDirectionTo(Node.pos(startNode));
        return [cost, startIdx];
    }


    /* Assign each creep/spawn with a task
       Input: none
       Return: none
    */
    static scheTask() {
        // Loop through each type of creep
        for (var type in Memory.taskQueue) {
            var queue = Memory.taskQueue[type];

            // Loop through each object in the ID pool
            for (var id of Memory.idPool[type]) {
                var creep = Game.getObjectById(id);
                var termi_flag = false;     // Flage of terminating loops

                // If creep has no task, find a task
                if (!creep.isBusy) {

                    // Loop through each priority level
                    for (var prio in Memory.taskQueue[type]) {
                        var level = queue[prio];
                        var minCost = Infinity;
                        var startIdx, cursor;

                        // Loop through each task, find the task with minimal cost
                        for (var i in level) {
                            var task = level[i];

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
                            creep.taskCursor = cursor;
                            Task.activate(level[cursor[2]], creep, startIdx);
                            break;
                        }
                    }
                }

                // Execute the task
            }
        }
    }

    /* ...
       Input:
       Return:
    */
}