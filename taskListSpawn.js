var TaskHandler = require('./taskHandler');
const C = require("./constant");

/*--------------------------- Standard functions ----------------------------*/

/* : 

*/

/* : 

*/

/*-----------------------------------Tasks-----------------------------------*/

/* Task 0 - spawn a screep
   Type: real-time
   Phase: 1
*/
var task0_moveList = [
    // Spawn a creep
    // Input: paraList.move[0] = [type, body]
    function(spawn, paraList) {
        var type = paraList.move[0][0];
        var body = paraList.move[0][1];
        var name;

        switch (type) {
            case C.SOLDIER:
                name = type + Memory.statistics.creepSoldierNum;
                break;
            case C.WORKER:
                name = type + Memory.statistics.creepWorkerNum;
                break;
        }

        paraList.action[0][0] = name;

        // Try to spawn
        if (spawn.spawnCreep(body, name) == OK) {
            if (type == C.WORKER) {
                Memory.statistics.creepWorkerNum += 1;
            } else {
                Memory.statistics.creepSoldierNum += 1;
            }
            Memory.statistics.creepNum += 1;
            return C.TASKHANDLER_MOVE_RET_FLG_REACH;
        } else {
            return C.TASKHANDLER_MOVE_RET_FLG_MOVE;
        }
        
    }
];

var task0_actionList = [
    // Waiting for spawning to finish, add it to new object list
    // Input: paraList.action[0] = [name]
    function(spawn, paraList) {
        if(spawn.spawning == null) {
            Memory.newObject.push(paraList.action[0][0]);
            return [C.TASKHANDLER_ACTION_RET_FLG_FINISH, 1];
        } else {
            return [C.TASKHANDLER_ACTION_RET_FLG_OCCUPY, null];
        }
    }
];

var task0_spawning = new TaskHandler(task0_moveList, task0_actionList);

var taskList_spawn = [
    task0_spawning
];

module.exports = taskList_spawn;
