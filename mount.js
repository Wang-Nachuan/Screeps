const extendCreep = require('./mount.creep');
const extendStruct = require('./mount.structure');
const initMemory = require('./mount.memory');

module.exports = function () {
    extendCreep();
    extendStruct();
    initMemory();
}