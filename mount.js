const extendCreep = require('./mount.creep');
const extendStruct = require('./mount.structure');

module.exports = function () {
    // Loading prototype extensions
    extendCreep();
    extendStruct();
}