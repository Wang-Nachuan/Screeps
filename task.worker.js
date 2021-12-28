/* Name: task.worker.js
   Function: shortcut constructor for tasks
*/

const C = require('./constant');
const Task = require("./task");

var tasks_worker = {

    /* Harvet energy srouce to fill the structure
       Input: from node (energy source), to node (structure), target amount of energy, request constant
    */
    harvestEnergy: function(fromNode, toNode, target_amount, request, token=null) {
        var nodes = [fromNode, toNode];
        // Range
        var para_mv = [1, 1];
        // Start
        var func_st = 'st_creepStore';
        var para_st = [[0, 1], RESOURCE_ENERGY, 0.5];
        // Operation
        var func_op = ['op_harvest', 'op_transfer'];
        var para_op = [null, [RESOURCE_ENERGY]];
        // Branch
        var func_br = [null, 'br_targetStore'];
        var para_br = [null, [[0, 2], RESOURCE_ENERGY, target_amount]];
        // End
        var func_ed = 'ed_delReq';
        var para_ed = [request];
        return new Task(C.WORKER, null, 0, 2, nodes, './handler.worker', para_mv, func_st, para_st, func_op, para_op, func_br, para_br, func_ed, para_ed, token);
    },

    /* Harvest energy srouce to upgrade controller
       Input: from node (energy source), to node (structure), target level
    */
    upgradeController: function(fromNode, toNode, level, token=null) {
        var nodes = [fromNode, toNode];
        // Range
        var para_mv = [1, 3];
        // Start
        var func_st = 'st_creepStore';
        var para_st = [[0, 1], RESOURCE_ENERGY, 0.5];
        // Operation
        var func_op = ['op_harvest', 'op_upgrade'];
        var para_op = [null, null];
        // Branch
        var func_br = [null, 'br_rcl'];
        var para_br = [null, [[0, 2], level]];
        return new Task(C.WORKER, null, 0, 2, nodes, './handler.worker', para_mv, func_st, para_st, func_op, para_op, func_br, para_br, null, null, token);
    },

    /* Harvest energy srouce to build construction
       Input: from node (energy source), to node (construction site), energy consumption, room name
    */
    buildStruct: function(fromNode, toNode, energy, room, token=null) {
        var nodes = [fromNode, toNode];
        // Range
        var para_mv = [1, 3];
        // Start
        var func_st = 'st_creepStore';
        var para_st = [[0, 1], RESOURCE_ENERGY, 0.5];
        // Operation
        var func_op = ['op_harvest', 'op_build'];
        var para_op = [null, null];
        // Branch
        var func_br = [null, 'br_cqIsEmpty'];
        var para_br = [null, [[0, 2]]];
        // End
        var func_ed = 'ed_decConstructCount';
        var para_ed = [room];
        return new Task(C.WORKER, null, energy, 2, nodes, './handler.worker', para_mv, func_st, para_st, func_op, para_op, func_br, para_br, func_ed, para_ed, token);
    },

    /* ...
       Input:
    */
}

module.exports = tasks_worker;