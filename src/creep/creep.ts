import {ObjectProto} from '../protos';
import {Task, TaskMemory} from '../task/Task';
import {Tasks} from '../task/tasks';

// export interface CreepMemory {
//     r: string;
//     t: TaskMemory;
// }

export class CreepWrapper extends ObjectProto { 
    protected _obj: any;
    protected _role: string;
    protected _task: Task;

    // Role must be provided at first instantiation
    constructor(isInit: boolean, id: Id<_HasId>, 
        opt?: {role: string}) 
    {
        super();
        this._obj = Game.getObjectById(id);
        if (isInit) {  // At creation
            this.role = opt.role;
            this.task = null;
            this.writeBack();
        } else {    // At rebuild
            this.unzip(this.mem);
        }
    }

    /*-------------------- Getter/Setter --------------------*/

    get mem(): CreepMemory {return this._obj.memory;}
    set mem(val: CreepMemory) {this._obj.memory = val;}

    get obj(): Creep {return this._obj;}
    set obj(val: Creep) {this._obj = val; this._isWritten = true;}

    get role(): string {return this._role;}
    set role(val: string) {this._role = val; this._isWritten = true;}

    get task(): Task {return this._task;}
    set task(val: Task) {this._task = val; this._isWritten = true;}

    /*------------------------ Method -----------------------*/

    zip() {
        this.mem = {
            r: this._role,
            t: (this._task) ? this._task.zip() : null
        }
    }

    unzip(pkg: CreepMemory) {
        this._role = pkg.r;
        this._task = Tasks.buildTask(pkg.t);
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