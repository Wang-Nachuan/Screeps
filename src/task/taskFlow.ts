import {ObjectProto} from '../protos'
import {Agent, AgentMemory} from '../agent/agent';
import {CreepWrapper, CreepMemory} from '../creep/creep';
import {StructureWrapper, StructureMemory} from '../struct/struct';
import {Task, TaskMemory} from './task'
import {Tasks} from './tasks';

export interface TaskFlowMemory {
    r: Array<Id<_HasId>>;
    q: Array<Array<TaskMemory>>;
}

export class TaskFlow extends ObjectProto {
    protected _ref: MemRef;
    protected _memObj: TaskFlowMemory;      // Cache memory object
    protected _receiver: Array<any>;
    protected _queue: Array<Array<Task>>;

    constructor(isInit: boolean, ref: MemRef) {
        super();
        this._ref = ref;
        this._memObj = getObjectInCache(false, this._ref);
        if (isInit) {
            this.receiver = [];
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

    get receiver(): Array<any> {return this._receiver;}
    set receiver(val: Array<any>) {this._receiver = val; this._isWritten = true;}

    get queue(): Array<Array<Task>> {return this._queue}
    set queue(val: Array<Array<Task>>) {this._queue = val; this._isWritten = true;}

    /*------------------------ Method -----------------------*/

    zip(): TaskFlowMemory {
        let pkg: TaskFlowMemory = {r: [], q: []};
        for (let receiver of this._receiver) {
            pkg.r.push(receiver.obj.id);
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
        this._receiver = [];
        this._queue = [[], [], [], [], []];
        for (let id of pkg.r) {
            this._receiver.push(Game.getObjectById(id));
        }
        for (let i in pkg.q) {
            for (let t of pkg.q[i]) {
                this._queue[i].push(Tasks.buildTask(t));
            }
        }
    }

    addReceiver(receiver: any) {
        this.receiver.push(receiver);
    }

    issue() {
        /* TODO */
    }

    exe() {
        /* TODO */
    }
}