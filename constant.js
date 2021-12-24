/* Name: constant.js
   Function: store constants for whole project
*/

class Const {

    /*----------------------------------- General -----------------------------------*/

    // Priority (the smaller the higher the priority)
    static PRIO_HOLYSHIT=  0;
    static PRIO_URGENT =  1;
    static PRIO_NORMAL = 2;

    // Roles of objects
    static SPAWN = 'spawn';
    static SOLDIER = 'soldier';
    static WORKER = 'worker';

    /*----------------------------------- Memory -----------------------------------*/
    
    // Task queue
    static MEMORY_TASKQUEUE_LEN = 5;
    static MEMORY_SPAWNQUEUE_LEN = 3;

    /*----------------------------------- Task -----------------------------------*/

    // Task state
    static TASK_STATE_PROPOSED = 0;     // Proposed
    static TASK_STATE_ISSUED = 1;       // Issued
    static TASK_STATE_SCHEDULED = 2;    // Scheduled
    static TASK_STATE_PENDED = 3;       // Pended

    /*------------------------------- Task Operations -------------------------------*/

    // Return flag of phase functions
    static TASK_OP_RET_FLG_OCCUPY = 0;       // Occupy (creep normally working on the operation)
    static TASK_OP_RET_FLG_FINISH = 1;       // Finish (current operation finished, branch first choice)
    static TASK_OP_RET_FLG_PEND = 2;         // Pend (require subtask)
    static TASK_OP_RET_FLG_TERMINATE = 3;    // Terminate (task stop normally)
    static TASK_OP_RET_FLG_HALT = 4;         // Halt (task stop unnormally)

    /*----------------------------------- Items -----------------------------------*/

    // Item type
    static ITEM_ENERGE = 0;         // Energy
    static ITEM_MINERAL = 1;        // Mineral
    static ITEM_DEPOSIT = 2;        // Deposit
    static ITEM_COMPOSITE = 3;      // Composite
    static ITEM_COMMODITIY = 4;     // Commodity
}

module.exports = Const;