const Plato = require("./plato");
const C = require("./constant");

class Euclid extends Plato {

    /* Wrapper function run in the main loop
       Input: none
       Return: none
    */
    static wrapper() {

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

    /* ...
       Input:
       Return:
    */
}