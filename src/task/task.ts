import {DataProto} from '../protos';
import {Tasks} from './tasks';

export interface TaskMemory {
    t: string;
    i: Id<_HasId>;
    d: {[key: string]: any};
    c: TaskMemory;
}

export abstract class Task extends DataProto {
    abstract readonly type: string;
    protected _targetId: Id<_HasId>;
    protected _target: any;     // Caching target object
    data: {[key: string]: any};
    child: Task | null;
    
    constructor(isInit: boolean, 
        opt?: {pkg?: TaskMemory, target?: any}) 
    {
        super();
        if (isInit) {
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

    // Here assume that target has an ID, which is true in most of time
    get target(): any {
        if (!this._target && this._targetId != null) {
            this._target = getObjectInCache(true, this._targetId);
        }
        return this._target;
    }
    set target(obj: any) {
        this._targetId = (obj == null) ? null : obj.id;
        this._target = obj;
    }

    /*------------------------ Method -----------------------*/

    zip(): TaskMemory {
        return {
            t: this.type,
            i: this._targetId,
            d: this.data,
            c: (this.child == null) ? null : this.child.zip()
        }
    }

    // Note: proto task does not unzip _child
    unzip(pkg: TaskMemory) {
        this._targetId = pkg.i;
        this._target = getObjectInCache(true, this._targetId);
        this.data = pkg.d;
        this.child = Tasks.buildTask(pkg.c);
    }

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
}