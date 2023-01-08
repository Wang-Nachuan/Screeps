import {ObjectProto} from '../protos';
import {TaskLog, TaskLogMemory} from '../task/taskLog';
import {Const} from '../const';

export interface AgentMemory {
    t: string;
    r: string;
    tl: TaskLogMemory;
    s: number;
    d: {[name:string]: any}
}

export abstract class Agent extends ObjectProto {
    readonly type: string = Const.TYPE_AGENT;
    protected _ref: MemRef;
    protected _roomName: string;
    protected _taskFlow: any;
    room: any;
    taskLog: TaskLog;
    state: number;
    data: {[name:string]: any}

    constructor(memKey: memId) {
        super(memKey);
        this._ref = ref;
        this._taskFlow = null;
        if (isInit) {
            this._roomName = roomName;
            this.room = (roomName) ? Game.rooms[roomName] : null;
            this.taskLog = new TaskLog(true);
            this.data = {};
        } else {
            this.load();
        }
    }

    /*-------------------- Getter/Setter --------------------*/

    get taskFlow(): any {
        if (!this._taskFlow) {
            this._taskFlow = getObjectInCache(false, this._ref.slice(0, -2)).taskFlow;
        }
        return this._taskFlow;
    }

    /*------------------------ Method -----------------------*/

    wb() {
        let mem = derefMem(this._ref);
        mem.t = this.type;
        mem.r = this._roomName;
        mem.tl = this.taskLog.zip();
        mem.s = this.state;
        mem.d = this.data;
    }

    load() {
        let mem = derefMem(this._ref);
        this._roomName = mem.r;
        this.room = (mem.r) ? Game.rooms[mem.r] : null;
        this.taskLog = new TaskLog(false, mem.tl); 
        this.state = mem.s;
        this.data = mem.d;
    }

}