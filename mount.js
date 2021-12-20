const extendCreep = require('./mount.creep');
const extendGame = require('./mount.game');

module.exports = function () {
    // Loading prototype extensions
    extendCreep();
    extendGame();
}