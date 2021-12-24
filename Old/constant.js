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
    

    /*----------------------------------- Plato -----------------------------------*/

    // Task array constants
    static PLATO_LEN_TASKARRAY_REALTIME = 3;
    static PLATO_LEN_TASKARRAY_DYNAMIC = 3;

    // Input of setSpawnReq function
    // Same as "Roles of objects" in General section

    /*----------------------------------- Task -----------------------------------*/

    // Desired task performer
    // Same as "Roles of objects" in General section

    // Task type
    static TASK_TYPE_REALTIME = 0;     // Real-time
    static TASK_TYPE_DYNAMIC = 1;      // Dynamic

    // Task state
    static TASK_STATE_INACTIVE = 0;    // Inactive
    static TASK_STATE_ACTIVE = 1;      // Active
    static TASK_STATE_PENDING = 2;     // Pending

    /*----------------------------------- TaskHandler -----------------------------------*/

    // Return flag of phase functions
    static TASKHANDLER_PHASE_RET_FLG_OCCUPY = 0;       // Occupy (creep normally working on the task)
    static TASKHANDLER_PHASE_RET_FLG_FINISH = 1;       // Finish (current phase finished, branch first choice)
    static TASKHANDLER_PHASE_RET_FLG_PEND = 2;         // Pend (require subtask)
    static TASKHANDLER_PHASE_RET_FLG_TERMINATE = 3;    // Terminate (task stop normally)
    static TASKHANDLER_PHASE_RET_FLG_HALT = 4;         // Halt (task stop unnormally)
    static TASKHANDLER_PHASE_RET_FLG_BRANCH = 5;       // Branch (ignore the orignal branch data, set phaseCursor += 1)

    /*----------------------------------- Items -----------------------------------*/
    // Item type
    static ITEM_ENERGE = 0;         // Energy
    static ITEM_MINERAL = 1;        // Mineral
    static ITEM_DEPOSIT = 2;        // Deposit
    static ITEM_COMPOSITE = 3;      // Composite
    static ITEM_COMMODITIY = 4;     // Commodity
}

module.exports = Const;