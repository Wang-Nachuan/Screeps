const C = require("./constant");

var handlerList_spawn = [
    
    /* Handler 0: spawn a creep
    In:
    [0] - (const) type of creep
    [1] - (list of const) body of creep
    Out:
    [0] - (string) name of creep
    */
    function handler_0_startSpawn(spawn, paraList, phaseCursor) {
        var type = paraList.io[phaseCursor].in[0];
        var body = paraList.io[phaseCursor].in[1];
        var name;
        
        switch (type) {
            case C.SOLDIER:
                name = type + Memory.statistics.creepSoldierNum;
                break;
            case C.WORKER:
                name = type + Memory.statistics.creepWorkerNum;
                break;
        }

        paraList.io[phaseCursor].out[0] = name;

        // Try to spawn
        if (spawn.spawnCreep(body, name) == OK) {
            if (type == C.WORKER) {
                Memory.statistics.creepWorkerNum += 1;
            } else {
                Memory.statistics.creepSoldierNum += 1;
            }
            Memory.statistics.creepNum += 1;
            return C.TASKHANDLER_PHASE_RET_FLG_FINISH;
        } else {
            return C.TASKHANDLER_PHASE_RET_FLG_OCCUPY;
        }
    },

    /* Handler 1: waiting for spawning to finish, add it to new object list
    In: none
    Out: none
    */
    function handler_1_finishSpawn(spawn, paraList, phaseCursor) {
        var name = paraList.io[phaseCursor - 1].out[0];
        if(spawn.spawning == null) {
            Memory.newObject.push(name);
            return C.TASKHANDLER_PHASE_RET_FLG_FINISH;
        } else {
            return C.TASKHANDLER_PHASE_RET_FLG_OCCUPY;
        }
    }
];

module.exports = handlerList_spawn;
