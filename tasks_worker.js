const C = require("./constant");
const TaskStamp = require("./taskStamp");

var tasks_worker = {

    /* Spawn a creep
       Input
       - type: (const) C.WORKER/C.SOLDIER
       - body: (list of const) list of body parts
    */
    spawn: function(type, body) {
        var handlerKey = [
            'startSpawn',
            'finishSpawn'
        ];
        var para_in = [
            [type, body], 
            null
        ];
        return new TaskStamp(C.TASKSTAMP_TASKTYPE_REALTIME, C.SPAWN, 2, handlerKey, [1, 2], para_in);
    },

    /* Harvest energy to fill a structure
       Input
       - id: (int) id of structure
    */
    harvestEnergy: function(id) {
        var handlerKey = [
            'branchByStore',
            'find',
            'moveTo',
            'harvest',
            'setTarget',
            'moveTo',
            'transfer',
            'termiByStore'
        ];
        var para_in = [
            [RESOURCE_ENERGY, 0.5],
            [FIND_SOURCES_ACTIVE, false], 
            [1, true], 
            null, 
            [id], 
            [1, true], 
            [RESOURCE_ENERGY],
            [RESOURCE_ENERGY, true]
        ];
        return new TaskStamp(C.TASKSTAMP_TASKTYPE_REALTIME, C.WORKER, 8, handlerKey, [4, 2, 3, 4, 5, 6, 7, 1], para_in);
    },

    /* Harvest energy to upgrade the room controller
       Input
       - level: (int) target level of controller
    */
    upgradeController: function(level) {
        var handlerKey = [
            'branchByStore',
            'find',
            'moveTo',
            'harvest',
            'find',
            'moveTo',
            'upgrade',
            'termiByLevel'
        ];
        var para_in = [
            [RESOURCE_ENERGY, 0.5],
            [FIND_SOURCES_ACTIVE, false], 
            [1, true], 
            null, 
            [FIND_STRUCTURES, true, [STRUCTURE_CONTROLLER]], 
            [1, true], 
            [RESOURCE_ENERGY],
            [level]
        ];
        return new TaskStamp(C.TASKSTAMP_TASKTYPE_REALTIME, C.WORKER, 8, handlerKey, [4, 2, 3, 4, 5, 6, 7, 1], para_in);
    },

    /* Harvest energy to build structures on construction sites
       Input: none
    */
    buildStruct: function() {
        var handlerKey = [
            'branchByStore',
            'find',
            'moveTo',
            'harvest',
            'getConstructSite',
            'moveTo',
            'buildStruct'
            
        ];
        var para_in = [
            [RESOURCE_ENERGY, 0.5],
            [FIND_SOURCES_ACTIVE, false], 
            [1, true], 
            null, 
            null, 
            [3, true], 
            null
        ];
        return new TaskStamp(C.TASKSTAMP_TASKTYPE_DYNAMIC, C.WORKER, 7, handlerKey, [4, 2, 3, 4, 5, 6, 0], para_in);
    },
};

module.exports = tasks_worker;