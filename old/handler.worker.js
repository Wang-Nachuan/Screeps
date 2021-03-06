/* Name: handler.worker.js
   Function: operation and branch functions for worker
*/

const C = require('./constant');

var handlers_worker = {

    /*-------------------- Operation --------------------*/

    /* Harvest energy/mineral from target
       Input: none
    */
    op_harvest: function(creep, node, para, task) {
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
    op_transfer: function(creep, node, para, task) {
        var target = Game.getObjectById(node.id);
        var item = para[0];

        // Transfer other items
        if (item != RESOURCE_ENERGY) {
            creep.transfer(target, item);
            return C.TASK_OP_RET_FLG_FINISH;
        }

        // Transfer energy
        if (creep.state == C.CREEP_STATE_NONE) {
            creep.state = C.CREEP_STATE_TRANSFER;
            creep.transfer(target, RESOURCE_ENERGY);
            return C.TASK_OP_RET_FLG_OCCUPY;
        } else {
            var diff = creep.store[RESOURCE_ENERGY] - creep.lastTickEn;
            task.energyStore += diff;
            if (task.energyStore < 0) {task.energyStore = 0;}
            creep.state = C.CREEP_STATE_NONE;
            return C.TASK_OP_RET_FLG_FINISH;
        }  
    },

    /* Withdraw item from target to creep
       Input:
       [0] - (const) type of item to be withdraw
    */
    op_withdraw: function(creep, node, para, task) {
        var target = Game.getObjectById(node.id);
        var item = para[0];

        // Withdraw other items
        if (item != RESOURCE_ENERGY) {
            creep.withdraw(target, item);
            return C.TASK_OP_RET_FLG_FINISH;
        }

        // Withdraw energy
        if (creep.state == C.CREEP_STATE_NONE) {
            creep.state = C.CREEP_STATE_WITHDRAW;
            creep.withdraw(target, RESOURCE_ENERGY);
            return C.TASK_OP_RET_FLG_OCCUPY;
        } else {
            var diff = creep.store[RESOURCE_ENERGY] - creep.lastTickEn;
            task.energyAcq += diff;
            task.energyStore += diff;
            if (task.energyStore < 0) {task.energyStore = 0;}
            creep.state = C.CREEP_STATE_NONE;
            return C.TASK_OP_RET_FLG_FINISH;
        }  
    },

    /* Upgrade the controller
       Input: none
    */
    op_upgrade: function(creep, node, para, task) {
        var target = Game.getObjectById(node.id);

        creep.upgradeController(target);
        if (creep.state == C.CREEP_STATE_NONE) {
            creep.state = C.CREEP_STATE_UPGRADE;
            return C.TASK_OP_RET_FLG_OCCUPY;
        } else {
            var diff = creep.store[RESOURCE_ENERGY] - creep.lastTickEn;
            if (diff == 0) {
                creep.state = C.CREEP_STATE_NONE;
                return C.TASK_OP_RET_FLG_FINISH;
            } else {
                task.energyStore += diff;
                if (task.energyStore < 0) {task.energyStore = 0;}
                return C.TASK_OP_RET_FLG_OCCUPY;
            }
        }
    },

    /* Work on construction site
       Input: none
    */
    op_build: function(creep, node, para, task) {
        var target = Game.getObjectById(node.id);

        if (target == null) {return C.TASK_OP_RET_FLG_FINISH;}

        creep.build(target);
        if (creep.state == C.CREEP_STATE_NONE) {
            creep.state = C.CREEP_STATE_BUILD;
            return C.TASK_OP_RET_FLG_OCCUPY;
        } else {
            var diff = creep.store[RESOURCE_ENERGY] - creep.lastTickEn;
            if (diff == 0) {
                creep.state = C.CREEP_STATE_NONE;
                return C.TASK_OP_RET_FLG_FINISH;
            } else {
                task.energyStore += diff;
                if (task.energyStore < 0) {task.energyStore = 0;}
                return C.TASK_OP_RET_FLG_OCCUPY;
            }
        }
    },

    /*--------------------- Start ----------------------*/

    /* Enter task by creep's item storage
       Input:
       [0] - (list of num) index branching to, i.e. [choice1, choice2, ...]
       [1] - (const) type of item
       [2] - (float) ratio of storage
    */
    st_creepStore: function(creep, node, para, task) {
        var item = para[1];
        var ratio = para[2];

        if (creep.store.getUsedCapacity(item) / creep.store.getCapacity(item) < ratio) {
            return para[0][0];
        } else {
            return para[0][1];
        }
    },

    /*---------------------- End -----------------------*/

    /* Decrement the Memory.constructQueue.numTask by 1
       Input:
       [0] - room name
    */
    ed_decConstructCount: function(creep, node, para, task) {
        if (Memory.constructQueue.numTask[para[0]] > 0) {
            Memory.constructQueue.numTask[para[0]] -= 1;
        }
    },

    /* Delete the specified request in node's request list 
       Input:
       [0] - request
    */
    ed_delReq: function(creep, node, para, task) {
        var req = para[0];
        var pool = Memory.nodePool[node.pos.roomName][node.type];

        // Detach object from the node (do not need to search in memory)
        if (pool != undefined) {
            for (var i of pool) {
                if (i.id == node.id) {
                    var idx = i.request.indexOf(req);
                    i.request.splice(idx, 1)
                    break;
                }
            }
        }
    },

    /*--------------------- Branch ---------------------*/

    /* Branch by target's item storage
       Input:
       [0] - (list of num) index branching to, i.e. [choice1, choice2, ...]
       [1] - (const) type of item
       [2] - (float) target amount
    */
    br_targetStore: function(creep, node, para, task) {
        var target = Game.getObjectById(node.id);
        var item = para[1];
        var amount = para[2];

        if (target.store.getUsedCapacity(item) < amount) {
            return para[0][0];
        } else {
            return para[0][1];
        }
    },

    /* Branch by room control level
       Input:
       [0] - (list of num) index branching to, i.e. [choice1, choice2, ...]
       [1] - (num) target room control level
    */
    br_rcl: function(creep, node, para, task) {
        var target = Game.getObjectById(node.id);
        var level = para[1];

        if (target.level < level) {
            return para[0][0];
        } else {
            return para[0][1];
        }
    },

    /* Branch by whether target exist
       Input:
       [0] - (list of num) index branching to, i.e. [choice1, choice2, ...]
    */
    br_targetExist: function(creep, node, para, task) {
        var target = Game.getObjectById(node.id);

        if (target != null) {
            return para[0][0];
        } else {
            return para[0][1];
        }
    },

    /* Branch by whether the scheduled construction queue is empty
       Input: none
    */
    br_cqIsEmpty: function(creep, node, para, task) {
        if (Memory.constructQueue.sche.length != 0) {
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