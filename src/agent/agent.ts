import {ObjectProto} from '../protos';
import {TaskLog, TaskLogMemory} from '../task/taskLog';

export interface AgentMemory {
    t: string;
    r: string;
    tl: TaskLogMemory;
    s: number;
    d: {[name:string]: any}
}

export abstract class Agent extends ObjectProto {
    abstract readonly type: string;
    protected _ref: MemRef;
    protected _memObj: AgentMemory;
    protected _roomName: string;
    room: any;
    protected _taskFlow: any;
    protected _taskLog: TaskLog;
    protected _state: number;
    protected _data: {[name:string]: any}

    constructor(isInit: boolean, ref: MemRef, roomName?: string) {
        super();
        this._ref = ref;
        this._memObj = derefMem(this._ref);
        this._taskFlow = null;
        if (isInit) {
            this._roomName = roomName;
            this.room = (roomName) ? Game.rooms[roomName] : null;
            this.taskLog = new TaskLog(true);
            this.data = {};
            this.writeBack();
        } else {
            this.unzip(this.mem);
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

    get taskFlow(): any {
        if (!this._taskFlow) {
            this._taskFlow = getObjectInCache(false, this._ref.slice(0, -2)).taskFlow;
        }
        return this._taskFlow;
    }

    /*------------------------ Method -----------------------*/

    zip() {
        this.mem.t = this.type;
        this.mem.r = this._roomName;
        this.mem.tl = this._taskLog.zip();
        this.mem.s = this._state;
        this.mem.d = this._data;
    }

    unzip(pkg: AgentMemory) {
        this._roomName = pkg.r;
        this.room = (pkg.r) ? Game.rooms[pkg.r] : null;
        this._taskLog = new TaskLog(false, pkg.tl); 
        this._state = pkg.s;
        this._data = pkg.d;
    }

    abstract exe();
}