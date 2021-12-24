/* Name: handler.worker.js
   Function: operation and branch functions for worker
*/

const C = require('./constant');

var handlers_worker = {

    /*-------------------- Operation --------------------*/

    /* Harvest energy/mineral from target
       Input: none
    */
    op_harvest: function(creep, node, para) {
        var target = Game.getObjectById(node.id);
        if(creep.store.getFreeCapacity() > 0) {
            creep.harvest(target);
            return C.TASK_OP_RET_FLG_OCCUPY;
        } else {
            return C.TASK_OP_RET_FLG_FINISH;
        }
    },

    /* Transfer item from creep to target
       Input:
       [0] - (const) type of item to be transfered
    */
    op_transfer: function(creep, node, para) {
        var target = Game.getObjectById(node.id);
        var item = para[0];
        creep.transfer(target, item)
        return C.TASK_OP_RET_FLG_FINISH;
    },

    /*--------------------- Branch ---------------------*/

    /* Branch by creep's item storage
       Input:
       [0] - (list of num) index branching to, i.e. [choice1, choice2, ...]
       [1] - (const) type of item
       [2] - (float) ratio of storage
    */
    br_creepStore: function(creep, node, para) {
        var item = para[1];
        var ratio = para[2];
        if (creep.store.getUsedCapacity(item) / creep.store.getCapacity(item) < ratio) {
            return para[0][0];
        } else {
            return para[0][1];
        }
    },

    /* Branch by target's item storage
       Input:
       [0] - (list of num) index branching to, i.e. [choice1, choice2, ...]
       [1] - (const) type of item
       [2] - (float) target amount
    */
    br_targetStore: function(creep, node, para) {
        var target = Game.getObjectById(node.id);
        var item = para[1];
        var amount = para[2];
        if (target.store.getUsedCapacity(item) < amount) {
            return para[0][0];
        } else {
            return para[0][1];
        }
    },

    /* ...
       Input:
    */
};

module.exports = handlers_worker;