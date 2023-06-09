import {ObjectProto} from '../protos'
import {Task, TaskMemory} from './task'
import {Tasks} from './tasks';

export interface TaskFlowMemory {
    r: Array<Id<_HasId>>;
    q: Array<Array<TaskMemory>>;
}

export class TaskFlow extends ObjectProto {
    protected _ref: MemRef;
    protected _loadFlag: boolean;
    protected _receivers: Array<any>;
    protected _queue: Array<Array<Task>>;

    constructor(isInit: boolean, ref: MemRef) {
        super();
        this._ref = ref;
        this._loadFlag = false;
        if (isInit) {
            this._receivers = [];
            this._queue = [[], [], []];
            this.wb();
        }
    }

    /*-------------------- Getter/Setter --------------------*/

    get receivers(): any {
        if (!this._loadFlag) {
            this.load();
            this._loadFlag = true;
        }
        return this._receivers;
    }

    get queue(): any {
        if (!this._loadFlag) {
            this.load();
            this._loadFlag = true;
        }
        return this._queue;
    }

    /*------------------------ Method -----------------------*/

    wb() {
        let mem = derefMem(this._ref);
        mem.r = [];
        for (let rec of this._receivers) {
            mem.r.push(rec.obj.id);
        }
        mem.q = [];
        for (let i of this._queue) {
            let temp = [];
            for (let task of i) {
                temp.push(task.zip())
            }
            mem.q.push(temp);
        }
    }

    load() {
        this._receivers = [];
        this._queue = [[], [], []];
        let mem = derefMem(this._ref);
        for (let id of mem.r) {
            this._receivers.push(getObjectInCache(true, id));
        }
        for (let i in mem.q) {
            for (let t of mem.q[i]) {
                this._queue[i].push(Tasks.buildTask(t));
            }
        }
    }

    // Addd a receiver to the poor
    addReceiver(receiver: any) {
        this.receivers.push(receiver);
    }

    // Publish a task with a priority in 0-4 (smaller means higher)
    pubTask(task: Task, prio: number) {
        this.queue[prio].push(task);
    }

    // Issue all tasks
    issue() {
        for (let prio=0; prio<3; prio++) {
            while (this.queue[prio][0]) {
                let maxEval = -Infinity;
                let idx = -1;
                for (let i=0; i<this.receivers.length; i++) {
                    if (!this.receivers[i].task) {
                        let temp = this.queue[prio][0].eval(this.receivers[i].obj);
                        if (temp > maxEval) {
                            maxEval = temp;
                            idx = i;
                        }
                    }
                }
                if (idx == -1) {
                    return;
                } else {
                    this.receivers[idx].task = this.queue[prio].shift();
                }
            }
        } 
    }

    // Wrapper function
    exe() {
        this.issue();
        for (let rec of this.receivers) {
            rec.exe();
        }
    }
}