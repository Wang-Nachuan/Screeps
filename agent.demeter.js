/* Name: agent.demeter.js
   Function: 
   - Manage resource harvest & transportation
   - Predict resource increment
   - Spawning worker creeps
*/

const Plato = require('./plato');
const C = require('./constant');
const tasks_worker = require('./task.worker');

class Demeter extends Plato {

    /* Wrapper function run in the main loop
       Input: none
       Return: none
    */
    static wrapper() {
        this.update();
        if (!Memory.tempFlag) {
            Memory.tempFlag = 1;
            this.propSpawnReq(C.WORKER, Memory.rooms.haveSpawn[0], [WORK, CARRY, MOVE, MOVE], 0);
            this.propTask(tasks_worker.harvestEnergy(Memory.nodePool.source[0], Memory.nodePool.spawn[0]), 0);
        }
    }

    /* Update some records at the begining of each tick
       Input: none
       Return: none
    */
    static update() {
        // Update energy statistics
        for (var roomName in Memory.statistics.energy) {
            var data = Memory.statistics.energy[roomName];
            data.available = Game.rooms[roomName].energyAvailable - data.pinned;
            if (data.available < 0) {
                data.available = 0;
            }
        }
    }

    /* ...
       Input:
       Return:
    */
}

module.exports = Demeter;