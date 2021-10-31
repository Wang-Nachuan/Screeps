class Constant {

    // Priority (the smaller the higher the priority)
    static HOLYSHIT=  0;
    static URGENT =  1;
    static NORMAL = 2;
    static TRIVIAL = 3;

    // Task type, e.i. the performer of task
    static WORKER = 0;     // Worker
    static SOLDIER = 1;    // Soldier
    static SPAWN = 2;      // Spawn

    // Task tage
    static SINGLE = 0;     // Single 
    static PERSIS = 1;     // Persistent 
    static EVEEM = 2;      // Event & Emergency 
    static EVEDY = 3;      // Event & Dynamic

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

module.exports = Constant;