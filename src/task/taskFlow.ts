import {ObjectProto} from '../protos'
import {CreepWrapper} from '../creep/creep';
import {Task, TaskMemory} from './task'
import {Tasks} from './tasks';

export interface TaskFlowMemory {
    r: Array<Id<_HasId>>;
    q: Array<Array<TaskMemory>>;
}

export class TaskFlow extends ObjectProto {
    protected _ref: MemRef;
    protected _memObj: TaskFlowMemory;      // Cache memory object
    protected _receivers: Array<any>;
    protected _queue: Array<Array<Task>>;

    constructor(isInit: boolean, ref: MemRef) {
        super();
        this._ref = ref;
        this._memObj = derefMem(this._ref);
        if (isInit) {
            this.receivers = [];
            this.queue = [[], [], [], [], []];
            this.writeBack();
        } else {
            this.unzip(this.mem);
        } 
    }

    /*-------------------- Getter/Setter --------------------*/

    get mem(): TaskFlowMemory {
        if (!this._memObj) {
            this._memObj = derefMem(this._ref);
        }
        return this._memObj;
    }
    set mem(val: TaskFlowMemory) {
        if (!this._memObj) {
            this._memObj = derefMem(this._ref);
        }
        this._memObj = val;
    }

    get ref(): MemRef {return this._ref;}
    set ref(val: MemRef) {
        this._ref = val;
        this._isWritten = true;
        this._memObj = derefMem(this._ref);
    }

    get receivers(): Array<any> {return this._receivers;}
    set receivers(val: Array<any>) {this._receivers = val; this._isWritten = true;}

    get queue(): Array<Array<Task>> {return this._queue}
    set queue(val: Array<Array<Task>>) {this._queue = val; this._isWritten = true;}

    /*------------------------ Method -----------------------*/

    zip(): TaskFlowMemory {
        let pkg: TaskFlowMemory = {r: [], q: []};
        for (let receivers of this._receivers) {
            pkg.r.push(receivers.obj.id);
        }
        for (let i of this._queue) {
            let temp = [];
            for (let task of i) {
                temp.push(task.zip())
            }
            pkg.q.push(temp);
        }
        return pkg;
    }

    unzip(pkg: TaskFlowMemory) {
        this._receivers = [];
        this._queue = [[], [], [], [], []];
        for (let id of pkg.r) {
            this._receivers.push(getObjectInCache(true, id));
        }
        for (let i in pkg.q) {
            for (let t of pkg.q[i]) {
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
        for (let prio=0; prio<5; prio++) {
            while (this.queue[prio][0]) {
                let maxEval = -Infinity;
                let idx = -1;
                for (let i=0; i<this.receivers.length; i++) {
                    if (!this.receivers[i].task) {
                        let temp = this.queue[prio][0].eval(this.receivers[i]);
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