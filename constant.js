class Const {

    // Priority (the smaller the higher the priority)
    static PRIO_HOLYSHIT=  0;
    static PRIO_URGENT =  1;
    static PRIO_NORMAL = 2;
    static PRIO_TRIVIAL = 3;

    /*----------------------------------- Plato -----------------------------------*/

    // Task array constants
    static PLATO_LEN_TASKARRAY_REALTIME = 5;
    static PLATO_LEN_TASKARRAY_DYNAMIC = 5;

    /*----------------------------------- TaskStamp -----------------------------------*/

    // Desired task performer
    static TASKSTAMP_PERFORMER_WORKER = 0;      // Worker
    static TASKSTAMP_PERFORMER_SOLDIER = 1;     // Soldier
    static TASKSTAMP_PERFORMER_SPAWN = 2;       // Spawn

    // Task type
    static TASKSTAMP_TASKTYPE_REALTIME = 0;     // Real-time
    static TASKSTAMP_TASKTYPE_DYNAMIC = 1;      // Dynamic

    // Task state
    static TASKSTAMP_TASKSTATE_ACTIVE = 0;      // Active
    static TASKSTAMP_TASKSTATE_PENDING = 1;     // Pending

    // Phase state
    static TASKSTAMP_PHASESTATE_MOVE = 0;       // Move
    static TASKSTAMP_PHASESTATE_ACTION = 1;     // Action

    /*----------------------------------- TaskHandler -----------------------------------*/

    // Return flag of move functions
    static TASKHANDLER_MOVE_RET_FLG_MOVE = 0;       // Move
    static TASKHANDLER_MOVE_RET_FLG_REACH = 1;      // Reach
    static TASKHANDLER_MOVE_RET_FLG_ERROR = 2;      // Error

    // Return flag of action functions
    static TASKHANDLER_ACTION_RET_FLG_OCCUPY = 0;       // Occupy
    static TASKHANDLER_ACTION_RET_FLG_FINISH = 1;       // Finish
    static TASKHANDLER_ACTION_RET_FLG_PEND = 2;         // Pend
    static TASKHANDLER_ACTION_RET_FLG_TERMINATE = 3;    // Terminate (task stop normally)
    static TASKHANDLER_ACTION_RET_FLG_HALT = 4;         // Halt (task stop unnormally)

    /*----------------------------------- Items -----------------------------------*/
    // Item type
    static ITEM_ENERGE = 0;         // Energy
    static ITEM_MINERAL = 1;        // Mineral
    static ITEM_DEPOSIT = 2;        // Deposit
    static ITEM_COMPOSITE = 3;      // Composite
    static ITEM_COMMODITIY = 4;     // Commodity
}

module.exports = Const;