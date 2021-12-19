const C = require("./constant");
const WorkerTasks = require('./tasks_worker');

var handlers_spawn = {
    
    /* Handler 0: spawn a creep
    In:
    [0] - (const) type of creep
    [1] - (list of const) body of creep
    Out:
    [0] - (string) name of creep
    */
    startSpawn: function(spawn, para, phaseCursor) {
        var type = para.in[phaseCursor][0];
        var body = para.in[phaseCursor][1];
        var name;
        
        switch (type) {
            case C.SOLDIER:
                name = type + Memory.statistics.creepSoldierNum;
                break;
            case C.WORKER:
                name = type + Memory.statistics.creepWorkerNum;
                break;
        }

        para.share = name;

        // Try to spawn
        var ret = spawn.spawnCreep(body, name);
        if (ret == OK) {
            // Update memory
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
    finishSpawn: function(spawn, para, phaseCursor) {
        var name = para.share;
        if(spawn.spawning == null) {
            Memory.newObject.push(name);
            return C.TASKHANDLER_PHASE_RET_FLG_FINISH;
        } else {
            return C.TASKHANDLER_PHASE_RET_FLG_OCCUPY;
        }
    }
};

module.exports = handlers_spawn;
