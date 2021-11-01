var Plato = require('./root_plato');
const C = require("./assist_constant");

class Demeter extends Plato {

    static init() {
        // Initialize memory when run constructor at the first time
        if (Memory.initFlag == 1) {
        }       
    }

    /*------------------------------Shortcut to memory-----------------------------*/
    

    
    /*-----------------------------------Methods-----------------------------------*/

    static test() {
        this.setTask(C.WORKER, C.PERSIS, C.TASK_WORKER_HARVEST_ENERGY);
        this.setTask(C.WORKER, C.PERSIS, C.TASK_WORKER_UPGRADE_ROOM);
    }

    /* Function: move objects from newly born list to ID list, set some fields
       Input: none
       Return: none
    */
    static educate() {

        var creep, spawn;

        for (var creepName in Memory.babyWorkerList) {
            creep = Game.creeps[creepName];
            // Add new fields to creep
            creep.isbusy = false;   // Is it working on a task
            creep.task = null;      // (Reference of TaskStamp) Task that it is working on
            // Store ID to ID list
            Memory.workerList.push(creep.id);
        }

        for (var spawnName in Memory.babySpawnList) {
            spawn = Game.spawns[spawnName];
            // Add new fields to creep
            spawn.isbusy = false;   // Is it working on a task
            spawn.task = null;      // (Reference of TaskStamp) Task that it is working on
            // Store ID to ID list
            Memory.spawnList.push(spawn.id);
        }

        // Clean two lists
        Memory.babyWorkerList = [];
        Memory.babySpawnList = [];
    }


    /* Function:
       Input
       - : 
       - : 
       Return
       - 
    */

}



// Task 2:

module.exports = Demeter;