import {ObjectProto} from '../protos'
import {Task, TaskMemory} from '../task/Task'
import {Tasks} from '../task/tasks'

export interface CreepMemory {
    r: string;
    t: TaskMemory;
}

export class CreepWrapper extends ObjectProto { 
    protected _obj: any;
    protected _role: string;
    protected _task: Task | null;

    // Role and task must be provided at first instantiation
    constructor(isInit: boolean, id: Id<_HasId>, role: string = '', agent: any = null, task: Task | null = null) {
        super();
        this._obj = Game.getObjectById(id);
        if (isInit) {  // At creation
            this.role = role;
            this.task = task;
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

    get task(): Task | null {return this._task;}
    set task(val: Task | null) {this._task = val; this._isWritten = true;}

    /*------------------------ Method -----------------------*/

    zip(): CreepMemory {
        return {
            r: this._role,
            t: (this._task == null) ? null : this._task.zip()
        };
    }

    unzip(pkg: CreepMemory) {
        this._role = pkg.r;
        this._task = Tasks.buildTask(pkg.t);
    }
}