/**
 *  Every task publisher should maintain a task log 
 */

import {DataProto} from "../protos";

export interface TaskLogMemory {
    [id: number]: {
        t: string;
        d: {[name: string]: any};
    };
}

export class TaskLog extends DataProto {
    log: {
        [id: number]: {
            taskName: string;
            data: {[name: string]: any};    // Used to recorder the desired result of task
        };
    };

    constructor(isInit: boolean, pkg?: TaskLogMemory) {
        super();
        if (isInit) {
            this.log = {};
        } else {
            this.unzip(pkg);
        }
    }

    zip(): TaskLogMemory {
        let pkg = {};
        for (let id in this.log) {
            pkg[id] = {
                t: this.log[id].taskName,
                d: this.log[id].data
            };
        }
        return pkg;
    }

    unzip(pkg: TaskLogMemory) {
        for (let id in pkg) {
            this.log[id] = {
                taskName: pkg[id].t,
                data: pkg[id].d
            };
        }
    }

    // Return an unique id
    addTask(taskName: string, data: any): number {
        for (let id=0; id<100; id++) {
            if (!this.log[id]) {
                this.log[id] = {
                    taskName: taskName,
                    data: data
                };
                return id;
            }
        }
        console.log("[WARNING] Function 'addTask()': Task ID exceed upper limit");
        return -1;
    }

    // Return the deleted task record, or null if task not found
    delTask(id: number): any {
        let ret = this.log[id];
        delete this.log[id];
        return ret;
    }
}