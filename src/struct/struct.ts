import {ObjectProto} from '../protos'
import {TaskLog, TaskLogMemory} from '@/task/taskLog';

export interface StructureMemory {
    i: Id<_HasId>;
    t: string;
    tl: TaskLogMemory;
}

export abstract class StructureWrapper extends ObjectProto {
    abstract readonly type: string;
    protected _ref: MemRef;
    protected _memObj: any;
    protected _obj: any;
    protected _taskLog: TaskLog;

    // Id and type must be provide at first instantiation
    constructor(isInit: boolean, ref: MemRef,
        opt?: {id?: Id<_HasId>, type?: string}) 
    {
        super();
        this._ref = ref;
        this._memObj = derefMem(this._ref);
        if (isInit) {
            this._obj = Game.getObjectById(opt.id);
            this._type = opt.type;
            this._taskLog = new TaskLog(true);
            this.writeBack();
        } else {
            this.unzip(this.mem);
        }
    }

    /*-------------------- Getter/Setter --------------------*/

    get mem(): StructureMemory {
        if (!this._memObj) {
            this._memObj = derefMem(this._ref);
        }
        return this._memObj;
    }
    set mem(val: StructureMemory) {
        if (!this._memObj) {
            this._memObj = derefMem(this._ref);
        }
        this._memObj = val;
    }

    get obj(): Structure {return this._obj;}
    set obj(val: Structure) {this._obj = val; this._isWritten = true;}

    get taskLog(): TaskLog {return this._taskLog;}
    set taskLog(val: TaskLog) {this._taskLog = val; this._isWritten = true;}

    /*------------------------ Method -----------------------*/

    zip(): StructureMemory {
        return {
            i: this._obj.id,
            t: this.type,
            tl: this._taskLog.zip()
        };
    }

    unzip(pkg: StructureMemory) {
        this._obj = Game.getObjectById(pkg.i);
        this._taskLog = new TaskLog(false, pkg.tl);
    }

    // Wrapper function
    exe() {
        // TODO: Check hit
        this.work();
    }

    // Do work, publish task if necessary
    abstract work();
}