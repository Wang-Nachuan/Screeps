/**
 *  Constants
 */

export class Constant {

    // Creep roles
    static readonly CREEP_ROLE_WORKER: string = 'worker';
    static readonly CREEP_ROLE_HARVESTER: string = 'harvester';
    static readonly CREEP_ROLE_TRANSPORTER: string = 'transporter';
    static readonly CREEP_ROLE_ATTACKER: string = 'attacker';
    static readonly CREEP_ROLE_HEALER: string = 'healer';
    static readonly CREEP_ROLE_CLAIMER: string = 'claimer';

    // Task types
    static readonly TASK_TYPE_MOVE: string = 'move';
    static readonly TASK_TYPE_HARVEST: string = 'harvest';

    // Return value of task
    static readonly TASK_RET_PROGRESS: number = 0;
    static readonly TASK_RET_FINISH: number = 1;
    static readonly TASK_RET_HALT: number = 2;
    static readonly TASK_RET_TARGET_LOST: number = 3;
    static readonly TASK_RET_OWNER_LOST: number = 4;
}