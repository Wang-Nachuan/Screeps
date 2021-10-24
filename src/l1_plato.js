const Archive = require("./l0_archive");
const C = require("./constant");

class Plato extends Archive {

    constructor() {
        super();
        Memory.taskQueue = {Emergency: [], Fixed: [], Dynamic: []};
    }

    /*---------------Shortcut to memory--------------*/
    get taskQueue() {
        return Memory.taskQueue;
    }

    
    /*--------------------Methods--------------------*/

    /* Function: receive a desired amount of change of a item, generate a task, add it to the task queue
       Input
       - item: name (global constant) of the item
       - itemType: (not completed) energy - 0
       - amountType: increment - 0; target - 1
       - amount: desired amount of increment/target in this item
       - taskType: S - Single, P - Persistent, EE - Event & Emergency, ED - Event & Dynamic
       Return
       - 0: success / -1: requirement has been met already (happen in "target" mode) / -2: allowable capacity is not enough
       Note: users should check for themselves that the allowable capacity is enough
    */
    setTask(item, itemType, amount, amountType, taskType) {

        var incre = 0;

        // Error check
        if (amountType == 0) {
            incre = amountType;
            // Check -2
            if (incre > Store.getFreeCapacity(item)) {
                return -2;
            }
        } else {
            incre = amountType - Store.getUsedCapacity(item);
            // Check -1
            if (incre <= 0) {
                return -1;
            }
            // Check -2
            if (incre > Store.getFreeCapacity(item)) {
                return -2;
            }
        }

        // Generate task object

        return;
    }


    /* Function:
       Input
       - : 
       - : 
       Return
       - 
    */

}

module.exports = Plato;