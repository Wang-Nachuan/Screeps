/* Name: memory.js
   Function: update information at beginning of each tick
*/

const C = require('./constant');

var update = function() {
    // Energy statistics
    for (var roomName in Memory.statistics.energy) {
        var data = Memory.statistics.energy[roomName];
        data.available = Game.rooms[roomName].energyAvailable - data.pinned;
        if (data.available < 0) {
            data.available = 0;
        }
    }
};

module.exports = update;