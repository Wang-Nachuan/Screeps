/* Name: agent.demeter.js
   Function: 
   - Manage resource harvest & transportation
   - Predict resource increment
   - Spawning worker creeps
*/

const Plato = require("./plato");
const C = require("./constant");

class Demeter extends Plato {

    /* Wrapper function run in the main loop
       Input: none
       Return: none
    */
    static wrapper() {
        this.#update();
    }

    /* Update some records at the begining of each tick
       Input: none
       Return: none
    */
   static #update() {
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