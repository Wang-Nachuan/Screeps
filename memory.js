/* Name: memory.js
   Function: initialize memory
*/

const Node = require('./node');
const C = require('./constant');

module.exports = function () {
    if (!Memory.initFlag) {
        Memory.initFlag = 1;

        // Proposed tasks queue
        Memory.propTaskQueue = {
            soldier: Array(C.MEMORY_TASKQUEUE_LEN),
            worker: Array(C.MEMORY_TASKQUEUE_LEN)
        };

        // Task queue
        Memory.taskQueue = {
            soldier: Array(C.MEMORY_TASKQUEUE_LEN),
            worker: Array(C.MEMORY_TASKQUEUE_LEN)
        };

        // Spawn request queue
        Memory.spawnQueue = {
            prop: Array(C.MEMORY_SPAWNQUEUE_LEN),   // Proposed
            sche: Array(C.MEMORY_SPAWNQUEUE_LEN)    // Scheduled
        }
        
        // Creep pool
        Memory.creepPool = {soldier: [], worker: []};

        // Node pool
        Memory.nodePool = {spawn: [], source: [], mineral: [], controller: []};

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

        // Initialization
        for (var i in Memory.taskQueue) {
            for (var j = 0; j < C.MEMORY_TASKQUEUE_LEN; j++) {
                Memory.taskQueue[i][j] = [];
                Memory.propTaskQueue[i][j] = [];
            }
        }

        for (var i = 0; i < C.MEMORY_SPAWNQUEUE_LEN; i++) {
            Memory.spawnQueue.prop[i] = [];
            Memory.spawnQueue.sche[i] = [];
        }

        for (var name in Game.rooms) {
            Memory.rooms.visibable.push(name);
            Memory.rooms.owned.push(name);
            Memory.rooms.haveSpawn.push(name);
            Memory.statistics.energy[name] = {available: 300, pinned: 0};

            var room = Game.rooms[name];
            var para = [FIND_MY_SPAWNS, FIND_SOURCES, FIND_MINERALS];
            var type = ['spawn', 'source', 'mineral'];
            for (var i = 0; i < para.length; i++) {
                var ret = room.find(para[i]);
                for (var obj of ret) {
                    Memory.nodePool[type[i]].push(new Node(obj.pos, type[i], obj.id));
                }
            }

            Memory.nodePool.controller.push(new Node(room.controller.pos, 'controller', room.controller.id));
        }
    }
};

