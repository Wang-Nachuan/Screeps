var TaskHandler = require('./assist_taskHandler');
const C = require("./assist_constant");

/*-----------------------------------Tasks-----------------------------------*/

/* Task 0 - harvest energy
   Type: worker
   Tag: persistent
   Phase: 1
*/
function task0_handler_0(creep, para) {
    if(creep.store.getFreeCapacity() > 0) {
        var sources = creep.room.find(FIND_SOURCES);
        if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
        }
    }
    else {
        var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
        });
        if(targets.length > 0) {
            if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
    }
}
function task0_check_0() {
    return false;
}
function task0_end() {
    return null;
}
var task1_harvEnergy = new TaskHandler([task0_handler_0], [task0_check_0], task0_end, [null]);

/* Task 1 - upgrade room controller
   Type: worker
   Tag: persistent
   Phase: 1
*/
function task1_handler_0(creep, para) {

    if(creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
        creep.memory.upgrading = false;
        creep.say('🔄 harvest');
    }
    if(!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
        creep.memory.upgrading = true;
        creep.say('⚡ upgrade');
    }

    if(creep.memory.upgrading) {
        if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
        }
    }
    else {
        var sources = creep.room.find(FIND_SOURCES);
        if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#ffaa00'}});
        }
    }
}
function task1_check_0() {
    return false;
}
function task1_end() {
    return null;
}
var task1_upgradeRoom = new TaskHandler([task1_handler_0], [task1_check_0], task1_end, [null]);

/*-----------------------------Export Task List------------------------------*/

var taskList_worker = [
    task1_harvEnergy,
    task1_upgradeRoom,
];

module.exports = taskList_worker;

