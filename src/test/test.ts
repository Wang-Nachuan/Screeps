import {Proto} from '../protos'

export class Test extends Proto {
    private _task: number;

    constructor(isNew: boolean, mem: any, task: number = 2, id: any = null, freq: number = 1) {
        super(mem, id, freq);
        if (isNew) {
            this.task = task;
            this.zip(this.mem);
        } else {
            this.unzip(this.mem);
        }
    }

    get task() {
        return this._task;
    }

    set task(val: number) {
        this._task = val;
        console.log('[1]', this.mem.t);
        this.mem.t = val;
    }

    zip(mem: any): any {
        mem.t = this.task;
        super.zip(mem.pre);
    }

    unzip(mem: any): any {
        this.task = mem.t;
        super.unzip(mem.pre);
    }

    act(): any {
        this.task += 1;
    }
}
