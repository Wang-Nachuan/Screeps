/* Name: task.worker.js
   Function: shortcut constructor for tasks
*/

const C = require('./constant');
const Task = require("./task");

var tasks_worker = {

    /* Harvet energy srouce to fill the structure
       Input: from node (energy source), to node (structure), target amount of energy
    */
    harvestEnergy: function(fromNode, toNode) {
        var nodes = [fromNode, toNode];
        // Start
        var func_st = 'br_creepStore';
        var para_st = [[0, 1], RESOURCE_ENERGY, 0.5];
        // Operation
        var func_op = ['op_harvest', 'op_transfer'];
        var para_op = [null, [RESOURCE_ENERGY]];
        // Branch
        var func_br = [null, 'br_targetStore'];
        var para_br = [null, [[0, 2], RESOURCE_ENERGY, Game.getObjectById(toNode.id).store.getCapacity(RESOURCE_ENERGY)]];
        return new Task(C.WORKER, null, 0, 2, nodes, './handler.worker', func_st, para_st, func_op, para_op, func_br, para_br);
    },

    /* ...
       Input
    */
}

module.exports = tasks_worker;