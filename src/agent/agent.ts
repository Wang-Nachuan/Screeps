import {ObjectProto} from '../protos';
import {TaskLog, TaskLogMemory} from '../task/taskLog';

export interface AgentMemory {
    t: string;
    tl: TaskLogMemory;
    s: number;
    d: {[name:string]: any}
}

export abstract class Agent extends ObjectProto {
    abstract readonly type: string;
    protected _ref: MemRef;
    protected _memObj: AgentMemory;
    protected _taskFlows: any;
    protected _taskLog: TaskLog;
    protected _state: number;
    protected _data: {[name:string]: any};
    
    readonly STATE_INIT = 0;

    constructor(isInit: boolean, ref: MemRef) {
        super();
        this._ref = ref;
        this._memObj = derefMem(this._ref);
        this._taskFlows = null;
        if (isInit) {
            this._taskLog = new TaskLog(true);
            this._state = this.STATE_INIT;
            this._data = {};
        }
    }

    /*-------------------- Getter/Setter --------------------*/

    get mem(): AgentMemory {
        if (!this._memObj) {
            this._memObj = derefMem(this._ref);
        }
        return this._memObj;
    }
    set mem(val: AgentMemory) {
        if (!this._memObj) {
            this._memObj = derefMem(this._ref);
        }
        this._memObj = val;
    }

    get taskLog(): TaskLog {return this._taskLog;}
    set taskLog(val: TaskLog) {this._taskLog = val; this._isWritten = true;}

    get state(): number {return this._state;}
    set state(val: number) {this._state = val; this._isWritten = true;}

    get data(): any {return this._data;}
    set data(val: any) {this._data = val; this._isWritten = true;}

    get taskFlows(): any {
        if (!this._taskFlows) {
            this._taskFlows = getObjectInCache(false, this._ref.slice(0, -2)).taskFlows;
        }
        return this._taskFlows;
    }

    /*------------------------ Method -----------------------*/

    zip(): AgentMemory {
        return {
            t: this.type,
            tl: this._taskLog.zip(),
            s: this._state,
            d: this._data
        };
    }

    unzip(pkg: AgentMemory) {
        this._taskLog = new TaskLog(false, pkg.tl);
        this._state = pkg.s;
        this._data = pkg.d;
    }

    abstract exe();
}