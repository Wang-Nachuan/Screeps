/* Name: memory.js
   Function: initialize memory
*/

const C = require("./constant");

module.exports = function () {
    if (!Memory.initFlag) {
        Memory.initFlag = 0;

        // Proposed tasks Queue
        Memory.propTaskQueue = {
            spawn: Array(C.MEMORY_TASKQUEUE_LEN),
            soldier: Array(C.MEMORY_TASKQUEUE_LEN),
            worker: Array(C.MEMORY_TASKQUEUE_LEN)
        };

        // Task Queue
        Memory.taskQueue = {
            spawn: Array(C.MEMORY_TASKQUEUE_LEN),
            soldier: Array(C.MEMORY_TASKQUEUE_LEN),
            worker: Array(C.MEMORY_TASKQUEUE_LEN)
        };
        
        // ID pool
        Memory.idPool = {spawn: [], soldier: [], worker: []};
        

        // Name of owned rooms
        Memory.rooms = {visibable: [], owned: [], haveSpawn: []};

        // Statistics
        Memory.statistics = {
            structure: {spawn: 1},
            creep: {worker: 0, soldier: 0},
            energy: {}      // roomName: {available: 0, pinned: 0}
        };

        // Memory space for agents
        Memory.agents = {};

        /*---------------------------- Add inital input ---------------------------*/ 
        
        for (var i of ['spawn', 'soldier', 'worker']) {
            for (var j = 0; j < C.MEMORY_TASKQUEUE_LEN; j++) {
                Memory.taskQueue[i][j] = [];
                Memory.propTaskQueue[i][j] = [];
            }
        }

        Memory.idPool.spawn.push(Game.spawns['Spawn1'].id);

        for (var room in Game.rooms) {
            Memory.rooms.visile.push(room);
            Memory.rooms.owned.push(room);
            Memory.rooms.haveSpawn.push(room);
            Memory.statistics.energy[room] = {available: 0, pinned: 0};
        }
    }
};

