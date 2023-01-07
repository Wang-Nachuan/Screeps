import {ObjectProto} from '../protos'
import {TaskLog, TaskLogMemory} from '../task/taskLog';
import {TaskFlow} from '../task/taskFlow';

export interface StructureMemory {
    i: Id<_HasId>;
    t: string;
    tl: TaskLogMemory;
    d: {[key: string]: any};
}

export class StructureWrapper extends ObjectProto {
    protected _type: string;
    protected _ref: MemRef;
    protected _memObj: any;
    protected _obj: any;
    protected _taskLog: TaskLog;
    protected _data: {[key: string]: any};

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

    get obj(): any {return this._obj;}

    get taskLog(): TaskLog {return this._taskLog;}
    set taskLog(val: TaskLog) {this._taskLog = val; this._isWritten = true;}

    get type(): string {return this._type;}
    set type(val: string) {this._type = val; this._isWritten = true;}

    get data(): any {return this._data;}
    set data(val: any) {this._data = val; this._isWritten = true;}

    get roomTaskFlows(): TaskFlow {return global.cache.rooms[this.obj.room.name].taskFlows;}

    /*------------------------ Method -----------------------*/

    zip(): StructureMemory {
        return {
            i: this._obj.id,
            t: this.type,
            tl: this._taskLog.zip(),
            d: this._data
        };
    }

    unzip(pkg: StructureMemory) {
        this._obj = Game.getObjectById(pkg.i);
        this._type = pkg.t;
        this._taskLog = new TaskLog(false, pkg.tl);
        this._data = pkg.d;
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