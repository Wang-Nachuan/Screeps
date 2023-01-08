import {ObjectProto} from '../protos';
import {Task, TaskMemory} from '../task/Task';
import {Tasks} from '../task/tasks';

// export interface CreepMemory {
//     r: string;
//     t: TaskMemory;
// }

export class CreepWrapper extends ObjectProto { 
    protected obj: any;
    protected role: string;
    protected task: Task;

    // Role must be provided at first instantiation
    constructor(isInit: boolean, id: Id<_HasId>, 
        opt?: {role: string}) 
    {
        super();
        this.obj = Game.getObjectById(id);
        if (isInit) {
            this.role = opt.role;
            this.task = null;
            this.wb();
        } else {
            this.load();
        }
    }

    /*------------------------ Method -----------------------*/

    wb() {
        this.obj.memory = {
            r: this.role,
            t: (this.task) ? this.task.zip() : null
        }
    }

    load() {
        this.role = this.obj.memory.r;
        this.task = Tasks.buildTask(this.obj.memory.t);
    }

    // Execute task if any
    work() {
        if (this.task) {
            let ret = this.task.exe(this.obj);
            if (ret == this.task.RET_FINISH) {
                this.task.owner.taskLog.finishTask(this.task.taskId);
                this.task = null;
            } else if (ret == this.task.RET_HALT) {
                this.task.owner.taskLog.haltTask(this.task.taskId);
                this.task = null;
            } else {}
        }
    }

    // Wrapper function
    exe() {
        // TODO: Check lifetime
        // TODO: Check hit
        this.work();
    }
}