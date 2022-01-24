/* Name: constant.js
   Function: store constants for whole project
*/

class Const {

    /*----------------------------------- General -----------------------------------*/

    // Priority
    static PRIO_HARVEST_ENERGY =  2;
    static PRIO_BUILD =  3;
    static PRIO_UPGRADE =  4;

    // Creep types
    static SOLDIER = 'soldier';
    static WORKER = 'worker';

    // Other types
    static SOURCE = 'source';
    static MINERAL = 'mineral';
    static CONSTRUCT_SITE = 'constructionSite';

    /* Token:
       [0:7] - index within process
       [8:11] - process header, 0xF for idividual event 
       [12:15] - agent header
    */

    // Token header for each agents
    static TOKEN_HEADER_DEMETER = 0x0000;       // Demeter
    static TOKEN_HEADER_HEPHAESTUS = 0x1000;    // Hephaestus

    /* Message:
       [token, message type, additional information (option)]
    */

    // Message type
    static MSG_TASK_TERMINATE = 0;      // Task terminate
    static MSG_TASK_HALT = 1;           // Task halt
    static MSG_PROCESS_TERMINATE = 2;   // Process terminate
    static MSG_REPORT_EMERGENCY = 3;    // Report emergency
    static MSG_CREEP_DEATH = 4;         // A creep is dead

    /*----------------------------------- Creep -----------------------------------*/

    // State of creep
    static CREEP_STATE_NONE = 0;        // None (empty state)
    static CREEP_STATE_TRANSFER = 1;    // Transfer (transferring item)
    static CREEP_STATE_WITHDRAW = 2;    // Withdraw (withdrawing item)
    static CREEP_STATE_UPGRADE = 3;     // Withdraw (withdrawing item)
    static CREEP_STATE_BUILD = 4;       // Withdraw (withdrawing item)


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