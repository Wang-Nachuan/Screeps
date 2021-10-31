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

}



// Task 2:

module.exports = Demeter;