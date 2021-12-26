/* Name: agent.demeter.js
   Function: 
   - Manage resource harvest & transportation
   - Building structures
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
            this.propSpawnReq(C.WORKER, Memory.rooms.haveSpawn[0], 0);
            this.propSpawnReq(C.WORKER, Memory.rooms.haveSpawn[0], 0);
            this.propSpawnReq(C.WORKER, Memory.rooms.haveSpawn[0], 0);
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