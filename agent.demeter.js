/* Name: agent.demeter.js
   Function: 
   - Manage resource harvest & transportation
   - Predict resource increment
   - Spawning worker creeps
*/

const Plato = require('./plato');
const C = require('./constant');

class Demeter extends Plato {

    /*-------------------- Public Methods --------------------*/

    /* Wrapper function run in the main loop
       Input: none
       Return: none
    */
    static wrapper() {
        this._update();
        if (!Memory.tempFlag) {
            Memory.tempFlag = 0;
            this.propSpawnReq('worker1', C.WORKER, Memory.rooms.haveSpawn[0], [WORK, CARRY, MOVE, MOVE], 0);
        }
    }

    /*-------------------- Private Methods --------------------*/

    /* Update some records at the begining of each tick
       Input: none
       Return: none
    */
    static _update() {
        // Update energy statistics
        for (var roomName in Memory.statistics.energy) {
            var data = Memory.statistics.energy[roomName];
            data.available = Game.rooms[roomName].energyAvailable - data.planned;
        }
    }

    /* ...
       Input:
       Return:
    */
}