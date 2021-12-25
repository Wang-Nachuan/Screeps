/* Name: task.worker.js
   Function: shortcut constructor for tasks
*/

const C = require('./constant');
const Task = require("./task");

var tasks_worker = {

    /* Harvet energy srouce to fill the structure
       Input: from node (energy source), to node (structure)
    */
    harvestEnergy: function(fromNode, toNode) {
        var nodes = [fromNode, toNode];
        // Range
        var para_mv = [1, 1];
        // Start
        var func_st = 'br_creepStore';
        var para_st = [[0, 1], RESOURCE_ENERGY, 0.5];
        // Operation
        var func_op = ['op_harvest', 'op_transfer'];
        var para_op = [null, [RESOURCE_ENERGY]];
        // Branch
        var func_br = [null, 'br_targetStore'];
        var para_br = [null, [[0, 2], RESOURCE_ENERGY, Game.getObjectById(toNode.id).store.getCapacity(RESOURCE_ENERGY)]];
        return new Task(C.WORKER, null, 0, 2, nodes, './handler.worker', para_mv, func_st, para_st, func_op, para_op, func_br, para_br);
    },

    /* Harvest energy srouce to upgrade controller
       Input: from node (energy source), to node (structure), target level
    */
    upgradeController: function(fromNode, toNode, level) {
        var nodes = [fromNode, toNode];
        // Range
        var para_mv = [1, 3];
        // Start
        var func_st = 'br_creepStore';
        var para_st = [[0, 1], RESOURCE_ENERGY, 0.5];
        // Operation
        var func_op = ['op_harvest', 'op_upgrade'];
        var para_op = [null, null];
        // Branch
        var func_br = [null, 'br_rcl'];
        var para_br = [null, [[0, 2], level]];
        return new Task(C.WORKER, null, 0, 2, nodes, './handler.worker', para_mv, func_st, para_st, func_op, para_op, func_br, para_br);
    },

    /* Harvest energy srouce to build construction
       Input: from node (energy source), to node (construction site)
    */
    buildStruct: function(fromNode, toNode) {
        var nodes = [fromNode, toNode];
        // Range
        var para_mv = [1, 3];
        // Start
        var func_st = 'br_creepStore';
        var para_st = [[0, 1], RESOURCE_ENERGY, 0.5];
        // Operation
        var func_op = ['op_harvest', 'op_build'];
        var para_op = [null, null];
        // Branch
        var func_br = [null, 'br_targetExist'];
        var para_br = [null, [[0, 2]]];
        return new Task(C.WORKER, null, 0, 2, nodes, './handler.worker', para_mv, func_st, para_st, func_op, para_op, func_br, para_br);
    },

    /* ...
       Input:
    */
}

module.exports = tasks_worker;