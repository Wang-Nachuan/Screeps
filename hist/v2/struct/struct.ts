import {ObjectProto} from '../protos'
import {TaskLog, TaskLogMemory} from '../task/taskLog';

export interface StructureMemory {
    i: Id<_HasId>;
    t: any;
    d: {[key: string]: any};
}

export class StructureWrapper extends ObjectProto {
    protected _ref: MemRef;
    protected _roomTaskFlow: any;
    obj: any;
    taskLog: TaskLog;
    data: {[key: string]: any};

    // Id and type must be provide at first instantiation
    constructor(isInit: boolean, ref: MemRef,
        opt?: {id?: Id<_HasId>}) 
    {
        super();
        this._ref = ref;
        this._roomTaskFlow = null;
        if (isInit) {
            this.obj = Game.getObjectById(opt.id);
            this.taskLog = new TaskLog(true);
            this.data = {};
            this.wb();
        } else {
            this.load();
        }
    }

    /*-------------------- Getter/Setter --------------------*/

    get roomTaskFlow(): any {
        if (!this._roomTaskFlow) {
            this._roomTaskFlow = getObjectInCache(false, this._ref.slice(0, -3)).taskFlow;
        }
        return this._roomTaskFlow;
    }

    /*------------------------ Method -----------------------*/

    wb() {
        let mem = derefMem(this._ref);
        mem.i = this.obj.id;
        mem.t = this.taskLog.zip();
        mem.d = this.data;
    }

    load() {
        let mem = derefMem(this._ref);
        this.obj = Game.getObjectById(mem.i);
        this.taskLog = new TaskLog(false, mem.t);
        this.data = mem.d;
    }

    // Check hit, publish task if necessary
    checkHit() {}

    // Do work, publish task if necessary
    work() {}

    // Wrapper function
    exe() {
        this.checkHit();
        this.work();
    }
}