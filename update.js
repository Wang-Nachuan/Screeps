/* Name: memory.js
   Function: update information at beginning of each tick
*/

const C = require('./constant');

var update = function() {
    // Energy statistics
    for (var roomName in Memory.statistics.energy) {
        var data = Memory.statistics.energy[roomName];
        if (data.pinned < 0) {data.pinned = 0;}
        data.available = Game.rooms[roomName].energyAvailable - data.pinned;
    }
};

module.exports = update;