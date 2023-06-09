import {ObjectProto} from '../protos';
import {Task, TaskMemory} from '../task/Task';
import {Tasks} from '../task/tasks';
import {Const} from '../const';
import {Mem} from '../memory/mem';

export interface CreepMemory {
    r: string;
    t: Addr;
}

export class ICreep extends ObjectProto { 
    readonly type: string = Const.TYPE_CREEP;
    private _task: Task;

    constructor(addr: Addr, obj?: any, para?: {role: string}) {
        super(addr, obj, para);
    }

    /*---------------------- Attribute ----------------------*/

    get role(): string {return this.memory.r;}
    set role(val: string) {this.memory.r = val;}

    get task(): Task {
        if (!this._task && this.memory.t) {
            this._task = new Task(this.memory.t);
        }
        return this._task;
    }
    set task(val: Task) {
        this._task = val;
        this.memory.t = (val) ? val.addr : null;
    }

    /*------------------------ Method -----------------------*/


    init(para: {role: string}) {
        this.role = para.role;
        this.task = null;
    }

    reload() {
        console.log('[Check Here] Wehter the task is loaded');
        this.task;
    }

    refresh() {
        super.refresh();
        if (this.task) {
            this.task.refresh();
        }
    }

    // Execute task if any
    run() {
        if (this.task) {
            let ret = this.task.run(this.obj);
            if (ret == this.task.RET_FINISH) {
                this.task.owner.taskLog.finishTask(this.task.taskId);
                this.task = null;
            } else if (ret == this.task.RET_HALT) {
                this.task.owner.taskLog.haltTask(this.task.taskId);
                this.task = null;
            } else {}
        }
    }
}