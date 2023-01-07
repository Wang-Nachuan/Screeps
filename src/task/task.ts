import {DataProto} from '../protos';
import {Tasks} from './tasks';

export interface TaskMemory {
    t: string;
    oi: boolean;
    or: MemRef | Id<_HasId>;
    ti: string;
    i: Id<_HasId>;
    d: {[key: string]: any};
    c: TaskMemory;
}

export abstract class Task extends DataProto {
    abstract readonly type: string;
    taskId: string;
    protected _ownerIsAgent: boolean;
    protected _ownerRef: MemRef | Id<_HasId>;
    protected _owner: any;
    protected _targetId: Id<_HasId>;
    protected _target: any;     // Caching target object
    data: {[key: string]: any};
    child: Task | null;
    
    constructor(isInit: boolean, 
        opt?: {
            pkg?: TaskMemory, 
            taskId?: string,
            owner?: {
                isAgent: boolean,
                ref: MemRef | Id<_HasId>
            } 
            target?: any
        }
    ) {
        super();
        if (isInit) {
            if(opt.owner) {
                this._ownerIsAgent = opt.owner.isAgent;
                this._ownerRef = opt.owner.ref;
                this._owner = null;
            } else {
                this._ownerIsAgent = false;
                this._ownerRef = null;
                this._owner = null
            }
            this.taskId = opt.taskId;
            this.target = opt.target;
            this.data = {};
            this.child = null;
        } else {
            this.unzip(opt.pkg);
        }
    }

    /*----------------------- Constant ----------------------*/

    readonly RET_OK = 0;            // Task is being executed normally
    readonly RET_FINISH = 1;        // Task finishes normally
    readonly RET_HALT = 2;          // Task finishes abnormally

    /*-------------------- Getter/Setter --------------------*/

    get target(): any {
        if (!this._target && this._targetId) {
            this._target = getObjectInCache(true, this._targetId);
        }
        return this._target;
    }
    set target(tar: any) {
        this._targetId = (tar) ? null : tar.obj.id;
        this._target = tar;
    }

    get owner(): any {
        if (!this._owner && this._ownerRef) {
            this._owner = getObjectInCache(!this._ownerIsAgent, this._ownerRef);
        }
        return this._owner;
    }

    /*------------------------ Method -----------------------*/

    zip(): TaskMemory {
        return {
            t: this.type,
            oi: this._ownerIsAgent,
            or: this._ownerRef,
            ti: this.taskId,
            i: this._targetId,
            d: this.data,
            c: (this.child == null) ? null : this.child.zip()
        }
    }

    // Note: proto task does not unzip _child
    unzip(pkg: TaskMemory) {
        this._ownerIsAgent = pkg.oi;
        this._ownerRef = pkg.or;
        this._owner = null;
        this.taskId = pkg.ti;
        this._targetId = pkg.i;
        this._target = null;
        this.data = pkg.d;
        this.child = Tasks.buildTask(pkg.c);
    }

    // Wrapper function
    exe(creep: Creep): number {
        if (this.child) {
            switch (this.child.exe(creep)) {
                case this.RET_OK: {
                    return this.RET_OK;
                }
                case this.RET_FINISH: {
                    this.child = null;
                    break;
                }
                case this.RET_HALT: {
                    this.child = null;
                    return this.RET_HALT;
                }
                default: {break;}
            }
        }
        return this.work(creep);
    }

    // Check validity and do actual work
    abstract work(creep: Creep): number;

    // Provid a value that how good is it to select input creep to perform the task (bigger means better) 
    abstract eval(creep: Creep): number;
}