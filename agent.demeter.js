/* Name: agent.demeter.js
   Function: 
   - Manage resource harvest & transportation
   - Predict resource increment
   - Spawning worker creeps
*/

const Plato = require('./plato');
const Node = require('./node');
const C = require('./constant');
const tasks_worker = require('./task.worker');

class Demeter extends Plato {

    /* Wrapper function run in the main loop
       Input: none
       Return: none
    */
    static wrapper() {
        if (!Memory.tempFlag) {
            Memory.tempFlag = 1;
            this.propSpawnReq(C.WORKER, Memory.rooms.haveSpawn[0], [WORK, WORK, CARRY, MOVE], 0);
            this.propSpawnReq(C.WORKER, Memory.rooms.haveSpawn[0], [WORK, WORK, CARRY, MOVE], 0);
            var fromNode = Memory.nodePool.source[0];
            var toNode = new Node({x: 0,y: 0, roomName: 'sim'}, 'constructionSites', null, true, 'constructSite');
            this.propTask(tasks_worker.buildStruct(fromNode, toNode), 4);
            this.propTask(tasks_worker.buildStruct(fromNode, toNode), 4);
            // this.propSpawnReq(C.WORKER, Memory.rooms.haveSpawn[0], [WORK, CARRY, MOVE, MOVE], 0);
            // this.propSpawnReq(C.WORKER, Memory.rooms.haveSpawn[0], [WORK, CARRY, MOVE, MOVE], 0);
            this.propTask(tasks_worker.harvestEnergy(Memory.nodePool.source[0], Memory.nodePool.spawn[0]), 0);
            // this.propTask(tasks_worker.upgradeController(Memory.nodePool.source[0], Memory.nodePool.controller[0], 2), 1);
            // this.propTask(tasks_worker.upgradeController(Memory.nodePool.source[0], Memory.nodePool.controller[0], 2), 1);
            // this.propTask(tasks_worker.upgradeController(Memory.nodePool.source[0], Memory.nodePool.controller[0], 8), 1);
        }
    }

    /* ...
       Input:
       Return:
    */
}

module.exports = Demeter;