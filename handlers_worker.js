const C = require("./constant");

var handlers_worker ={
    
    /* Move to a target 
    In:
    [0] - acceptable range between current position and target
    [1] - If true, get target by id / If false, get target by position
    */
    moveTo: function(creep, para, phaseCursor) {
        var range = para.in[phaseCursor][0];
        var target;
        if (para.in[phaseCursor][1]) {
            target = Game.getObjectById(para.targetID);
        } else {
            target = new RoomPosition(para.targetPos[0], para.targetPos[1], para.targetPos[2]);
        }
        // Move
        creep.moveTo(target);
        // Check for reaching
        if (creep.pos.inRangeTo(target, range)) {
            return C.TASKHANDLER_PHASE_RET_FLG_FINISH;
        } else {
            return C.TASKHANDLER_PHASE_RET_FLG_OCCUPY;
        }
    },

    /* Find a object, set target
    In: 
    [0] - (const) type of resource
    [1] - (list of const) excule those type of structures while searching
    */
    find: function(creep, para, phaseCursor) {
        var type = para.in[phaseCursor][0];
        var flage = para.in[phaseCursor][1];
        var obj;
        if (flage) {
            obj = creep.room.find(type, {
                filter: (obj) => {
                    return (para.in[phaseCursor][2].includes(obj.structureType));
                }
            })[0];
        } else {
            obj = creep.room.find(type)[0];
        }
        para.targetID = obj.id;
        return C.TASKHANDLER_PHASE_RET_FLG_FINISH;
    },

    /* Set target to given object
    In: 
    [0] - (int) id of target object
    */
    setTarget: function(creep, para, phaseCursor) {
        para.targetID = para.in[phaseCursor][0];
        return C.TASKHANDLER_PHASE_RET_FLG_FINISH;
    },

    /* Harvest item from target
    In: none
    */
    harvest: function(creep, para, phaseCursor) {
        var target = Game.getObjectById(para.targetID);
        if(creep.store.getFreeCapacity() > 0) {
            creep.harvest(target);
            return C.TASKHANDLER_PHASE_RET_FLG_OCCUPY;
        } else {
            return C.TASKHANDLER_PHASE_RET_FLG_FINISH;
        }
    },

    /* Transfer item from creep to target
    In:
    [0] - (const) type of item to be transfered
    */
    transfer: function(creep, para, phaseCursor) {
        var target = Game.getObjectById(para.targetID);
        var item = para.in[phaseCursor][0];
        if (creep.store.getUsedCapacity(item) > 0) {
            if (ERR_FULL == creep.transfer(target, item)) {
                return C.TASKHANDLER_PHASE_RET_FLG_FINISH;
            } else {
                return C.TASKHANDLER_PHASE_RET_FLG_OCCUPY;
            }
        } else {
            return C.TASKHANDLER_PHASE_RET_FLG_FINISH;
        }
    },

    /* Upgrade controller
    In: none
    */
    upgrade: function(creep, para, phaseCursor) {
        var target = Game.getObjectById(para.targetID);
        if(creep.store[RESOURCE_ENERGY] > 0) {
            creep.upgradeController(target);
            return C.TASKHANDLER_PHASE_RET_FLG_OCCUPY;
        } else {
            return C.TASKHANDLER_PHASE_RET_FLG_FINISH;
        }
    },

    /* Terminate the task when target's storage of an item reaches a given amount
    In: 
    [0] - (const) item type
    [1] - (boolean) if true, target amount == full capacity
    [2] - (optional, int) target amount
    */
    termiByStore: function(creep, para, phaseCursor) {
        var item = para.in[phaseCursor][0];
        var flag = para.in[phaseCursor][1];
        var target = Game.getObjectById(para.targetID);
        if (flag) {
            // Terminate until target is full of item
            if (target.store.getFreeCapacity(item) > 0) {
                return C.TASKHANDLER_PHASE_RET_FLG_FINISH;      // Return 'finish' will set phaseCursor to 0
            } else {
                return C.TASKHANDLER_PHASE_RET_FLG_TERMINATE;
            }
        } else {
            if (target.store.getUsedCapacity(item) < para.in[phaseCursor][2] && target.store.getFreeCapacity(item) > 0) {
                return C.TASKHANDLER_PHASE_RET_FLG_FINISH;
            } else {
                return C.TASKHANDLER_PHASE_RET_FLG_TERMINATE;
            }
        }
    },

    /* Function
    In: none
    */
    // f_name: function(creep, para, phaseCursor) {
        
    // },
};

module.exports = handlers_worker;

