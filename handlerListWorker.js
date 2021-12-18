const C = require("./constant");

var handlerList_worker =[
    
    /* Handler 0: move to a target 
    In:
    [0] - acceptable range between current position and target
    [1] - If true, get target by id / If false, get target by position
    Out: none
    */
    function handler_0_moveTo(creep, paraList, phaseCursor) {
        var range = paraList.io[phaseCursor].in[0];
        var target;
        if (paraList.io[phaseCursor].in[1]) {
            target = Game.getObjectById(paraList.targetID);
        } else {
            target = new RoomPosition(paraList.targetPos[0], paraList.targetPos[1], paraList.targetPos[2]);
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

    /* Handler 1: find a object set target (if multiple object are finded, only output the first one)
    In: 
    [0] - (const) type object to be find
    [1] - (Boolean) true - enbale filter / false - disable filter
    [2] - (list of const) parameter for filter 
    Out:
    targetID - (int) id of object
    */
    function handler_1_find(creep, paraList, phaseCursor) {
        var type = paraList.io[phaseCursor].in[0];
        var flage = paraList.io[phaseCursor].in[1];
        var obj;
        if (flage) {
            obj = creep.room.find(type, {
                filter: (obj) => {
                    return (paraList.io[phaseCursor].in[2].includes(obj.structureType));
                }
            })[0];
        } else {
            obj = creep.room.find(type)[0];
        }
        paraList.targetID = obj.id;
        return C.TASKHANDLER_PHASE_RET_FLG_FINISH;
    },

    /* Handler 2: harvest item from target
    In: none
    Out: none
    */
    function handler_2_harvest(creep, paraList, phaseCursor) {
        var target = Game.getObjectById(paraList.targetID);
        if(creep.store.getFreeCapacity() > 0) {
            creep.harvest(target);
            return C.TASKHANDLER_PHASE_RET_FLG_OCCUPY;
        } else {
            return C.TASKHANDLER_PHASE_RET_FLG_FINISH;
        }
    },

    /* Handler 3: transfer item from creep to target
    In:
    [0] - type of item to be transfered
    Out: none
    */
    function handler_3_transfer(creep, paraList, phaseCursor) {
        var target = Game.getObjectById(paraList.targetID);
        var item = paraList.io[phaseCursor].in[0];
        if(creep.store[item] > 0) {
            creep.transfer(target, item);
            return C.TASKHANDLER_PHASE_RET_FLG_OCCUPY;
        } else {
            return C.TASKHANDLER_PHASE_RET_FLG_FINISH;
        }
    },

    /* Handler n: 
    In: none
    Out: none
    */
    // function handler_n_name(creep, paraList, phaseCursor) {
        
    // }
]

module.exports = handlerList_worker;

