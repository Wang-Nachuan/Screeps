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

        para.share = [name, body];

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
        var name = para.share[0];
        var body = para.share[1];
        if(spawn.spawning == null) {
            var creep = Game.creeps[name];
            // Add to pool
            switch (name[0]) {
                case 'w':   // worker
                    creep.memory.role = C.WORKER;
                    Memory.objectPool.worker.push(creep.id);
                    break;
                case 's':   // soldier
                    creep.memory.role = C.SOLDIER;
                    Memory.objectPool.soldier.push(creep.id);
                    break
            }
            // Add other attributes
            creep.memory.busy = false;
            creep.memory.taskCursor = null;
            var count = {move: 0, work: 0, carry: 0, attack: 0, rangedAttack: 0, heal: 0, claim: 0, tough: 0};
            for (var part of body) {
                switch (part) {
                    case MOVE:
                        count.move += 1;
                        break;
                    case WORK:
                        count.work += 1;
                        break;
                    case CARRY:
                        count.carry += 1;
                        break;
                    case ATTACK:
                        count.attack += 1;
                        break;
                    case RANGED_ATTACK:
                        count.rangedAttack += 1;
                        break;
                    case HEAL:
                        count.heal += 1;
                        break;
                    case CLAIM:
                        count.claim += 1;
                        break;
                    case TOUGH:
                        count.tough += 1;
                        break;
                }
            }
            creep.memory.bodyCount = count;
            return C.TASKHANDLER_PHASE_RET_FLG_FINISH;
        } else {
            return C.TASKHANDLER_PHASE_RET_FLG_OCCUPY;
        }
    }
};

module.exports = handlers_spawn;
