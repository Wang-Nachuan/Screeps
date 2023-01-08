import {ObjectProto} from '../protos'
import {TaskLog, TaskLogMemory} from '../task/taskLog';

export interface StructureMemory {
    i: Id<_HasId>;
    t: any;
    d: {[key: string]: any};
}

export class StructureWrapper extends ObjectProto {
    protected _ref: MemRef;
    protected _memObj: any;
    protected _obj: any;
    protected _roomTaskFlow: any;
    protected _taskLog: TaskLog;
    protected _data: {[key: string]: any};

    // Id and type must be provide at first instantiation
    constructor(isInit: boolean, ref: MemRef,
        opt?: {id?: Id<_HasId>}) 
    {
        super();
        this._ref = ref;
        this._memObj = derefMem(this._ref);
        this._roomTaskFlow = null;
        if (isInit) {
            this._obj = Game.getObjectById(opt.id);
            this.taskLog = new TaskLog(true);
            this.data = {};
            this.writeBack();
        } else {
            this.unzip(this.mem);
        }
    }

    /*-------------------- Getter/Setter --------------------*/

    get mem(): StructureMemory {
        // if (!this._memObj) {
        //     this._memObj = derefMem(this._ref);
        // }
        // return this._memObj;
        return derefMem(this._ref);
    }
    // set mem(val: StructureMemory) {
    //     // if (!this._memObj) {
    //     //     this._memObj = derefMem(this._ref);
    //     // }
    //     this._memObj = derefMem(this._ref);
    //     this._memObj = val;
    // }

    get obj(): any {return this._obj;}

    get taskLog(): TaskLog {return this._taskLog;}
    set taskLog(val: TaskLog) {this._taskLog = val; this._isWritten = true;}

    get data(): any {return this._data;}
    set data(val: any) {this._data = val; this._isWritten = true;}

    get roomTaskFlow(): any {
        if (!this._roomTaskFlow) {
            this._roomTaskFlow = getObjectInCache(false, this._ref.slice(0, -2)).taskFlow;
        }
        return this._roomTaskFlow;
    }

    /*------------------------ Method -----------------------*/

    zip() {
        console.log('[1.3]', this._memObj);
        this.mem.i = this._obj.id;
        this.mem.t = this._taskLog.zip();
        this.mem.d = this._data;
        console.log('[1.4]', this._data.curReq);
    }

    unzip(pkg: StructureMemory) {
        this._obj = Game.getObjectById(pkg.i);
        this._taskLog = new TaskLog(false, pkg.t);
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