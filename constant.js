class Const {

    // Priority (the smaller the higher the priority)
    static HOLYSHIT=  0;
    static URGENT =  1;
    static NORMAL = 2;
    static TRIVIAL = 3;

    /*----------------------------------- Plato -----------------------------------*/

    // Task array constants
    static lengthRealTimeArray = 3;
    static lengthDynamicArray = 5;

    /*----------------------------------- TaskStamp -----------------------------------*/

    // Desired task performer
    static WORKER = 0;      // Worker
    static SOLDIER = 1;     // Soldier
    static SPAWN = 2;       // Spawn

    // Task type
    static REALTIME = 0;    // Real-time
    static DYNAMIC = 1;     // Dynamic

    // Task state
    static ACTIVE = 0;      // Active
    static PENDING = 1;     // Pending

    // Phase state
    static MOVE = 0;        // Move
    static ACTION = 1;      // Action

    /*----------------------------------- TaskHandler -----------------------------------*/

    // Return flag of action functions
    static OCCUPY = 0;      // Occupy
    static FINISH = 1;      // Finish
    static PEND = 2;        // Pend
    static TERMINATE = 3    // Terminate (task stop normally)
    static HALT = 4;        // Halt (task stop unnormally)

    // Item type
    static ENERGE = 0;         // Energy
    static MINERAL = 1;        // Mineral
    static DEPOSIT = 2;        // Deposit
    static COMPOSITE = 3;      // Composite
    static COMMODITIY = 4;     // Commodity

    

    // Worker task index
    static TASK_WORKER_HARVEST_ENERGY = 0;      // Worker Task 0 - harvest energy
    static TASK_WORKER_UPGRADE_ROOM = 1;        // Worker Task 1 - upgrade room controller

    // Spawn task index
    static TASK_SPAWN_CREAT_CREEP_I = 0;       // Spawn Task 0 - creat creep I
}

module.exports = Const;