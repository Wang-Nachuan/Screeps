import {Proto} from '../proto'

export class Test extends Proto {
    task: number;

    constructor(isNew: boolean, mem: any, task: number = 2, id: any = null, freq: number = 1) {
        super(mem, id, freq);
        if (isNew) {
            this.task = task;
            this.zip(mem);
        } else {
            this.unzip(mem);
        }
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
        console.log(this.task);
    }
}
