const C = require("./constant");
const TaskStamp = require("./taskStamp");

var tasks_worker = {

    /* Spawn a creep
       Input
       - type: (const) C.WORKER/C.SOLDIER
       - body: (list of const) list of body parts
    */
    spawn: function(type, body) {
        var handlerIdx = [
            'startSpawn',
            'finishSpawn'
        ];
        var para_in = [
            [type, body], 
            null
        ];
        return new TaskStamp(C.TASKSTAMP_TASKTYPE_REALTIME, C.SPAWN, 2, handlerIdx, [1, 2], para_in);
    },

    /* Harvest energy to fill a structure
       Input
       - id: (int) id of structure
    */
    harvestEnergy: function(id) {
        var handlerIdx = [
            'find',
            'moveTo',
            'harvest',
            'setTarget',
            'moveTo',
            'transfer',
            'termiByStore'
        ];
        var para_in = [
            [FIND_SOURCES_ACTIVE, false], 
            [1, true], 
            null, 
            [id], 
            [1, true], 
            [RESOURCE_ENERGY],
            [RESOURCE_ENERGY, true]
        ];
        return new TaskStamp(C.TASKSTAMP_TASKTYPE_REALTIME, C.WORKER, 7, handlerIdx, [1, 2, 3, 4, 5, 6, 0], para_in);
    },

    /* Harvest energy to upgrade the room controller
       Input
       - id: (int) id of structure
    */
    upgradeController: function() {
        var handlerIdx = [
            'find',
            'moveTo',
            'harvest',
            'find',
            'moveTo',
            'upgrade'
        ];
        var para_in = [
            [FIND_SOURCES_ACTIVE, false], 
            [1, true], 
            null, 
            [FIND_STRUCTURES, true, [STRUCTURE_CONTROLLER]], 
            [1, true], 
            [RESOURCE_ENERGY],
            [RESOURCE_ENERGY, true]
        ];
        return new TaskStamp(C.TASKSTAMP_TASKTYPE_REALTIME, C.WORKER, 7, handlerIdx, [1, 2, 3, 4, 5, 0], para_in);
    }
};

module.exports = tasks_worker;