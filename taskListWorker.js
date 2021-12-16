var TaskHandler = require('./taskHandler');
const C = require("./constant");

/*--------------------------- Standard functions ----------------------------*/

/* find_source: 

*/

/* find_struct: 

*/

/*-----------------------------------Tasks-----------------------------------*/

/* Task 0 - harvest energy
   Type: real-time
   Phase: 2
*/
var task0_moveList = [
    // Move to energy source
    function(creep, paraList) {
        var target = creep.room.find(FIND_SOURCES)[0];
        paraList.move[0][0] = target.id;
        if(creep.harvest(target) == ERR_NOT_IN_RANGE) {
            return target;
        } else {
            return C.TASKHANDLER_MOVE_RET_FLG_REACH;
        }
    },
    // Move to structures
    function(creep, paraList) {
        var target = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        })[0];
        paraList.move[1][0] = target.id;
        if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            return target;
        } else {
            return C.TASKHANDLER_MOVE_RET_FLG_REACH;
        }
    },
];

var task0_actionList = [
    // Collect energy
    function(creep, paraList) {
        var target = Game.getObjectById(paraList.move[0][0]);
        if(creep.store.getFreeCapacity() > 0) {
            creep.harvest(target);
            return [C.TASKHANDLER_ACTION_RET_FLG_OCCUPY, null];
        } else {
            return [C.TASKHANDLER_ACTION_RET_FLG_FINISH, 1];
        }
    },
    function(creep, paraList) {
        var target = Game.getObjectById(paraList.move[1][0]);
        if(creep.store[RESOURCE_ENERGY] > 0) {
            creep.transfer(target, RESOURCE_ENERGY);
            return [C.TASKHANDLER_ACTION_RET_FLG_OCCUPY, null];
        } else {
            return [C.TASKHANDLER_ACTION_RET_FLG_FINISH, 0];
        }
    },
];

var task0_harvestEnergy = new TaskHandler(task0_moveList, task0_actionList);




/* Task i - *name*
   Type: 
   Phase: n
*/
// var taski_moveList = [];
// var taski_actionList = [];
// var taski_name = new TaskHandler(taski_moveList, taski_actionList);
// var taski_stamp = new TaskStamp();

/*-----------------------------Export Task List------------------------------*/

var taskList_worker = [
    task0_harvestEnergy
    // task2_upgradeRoom,
];

module.exports = taskList_worker;

