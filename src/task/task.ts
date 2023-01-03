import {DataProto} from '../protos'
import {Tasks} from './tasks'

export interface TaskMemory {
    t: string;
    r: Ref;
    d: {[key: string]: any};
    c: TaskMemory;
}

export abstract class Task extends DataProto {
    type: string;
    protected _targetRef: Ref;        
    protected _target: any;     // Caching target object
    data: {[key: string]: any};
    child: Task | null;
    
    constructor(isInit: boolean, pkg: TaskMemory, type: string = '', target: any = null) {
        super();
        if (isInit) {
            this.type = type;
            this.target = target;
            this.data = {};
            this.child = null;
        } else {
            this.unzip(pkg);
        }
    }

    /*-------------------- Getter/Setter --------------------*/

    get target(): any {
        if (!this._target) {
            this._target = deref(this._targetRef);
        }
        return this._target;
    }
    set target(obj: any) {
        this._targetRef = enref(obj);
        this._target = obj;
    }

    /*------------------------ Method -----------------------*/

    zip(): TaskMemory {
        return {
            t: this.type,
            r: this._targetRef,
            d: this.data,
            c: (this.child == null) ? null : this.child.zip()
        }
    }

    // Note: proto task does not unzip _child
    unzip(pkg: TaskMemory) {
        this.type = pkg.t;
        this._targetRef = pkg.r;
        this._target = deref(this._targetRef);
        this.data = pkg.d;
        this.child = Tasks.buildTask(pkg.c);
    }

    // Condition check for all tasks
    stdCheck(): boolean {
        return true;
    }

    // Customized condition check for each task
    abstract cstCheck(): boolean;

    abstract exe();     // TODO: Need to support recursive execution
}