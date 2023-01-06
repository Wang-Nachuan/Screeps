/**
 *  Every task publisher should maintain a task log 
 */

import {DataProto} from "../protos";

export interface TaskLogMemory {
    [id: string]: {[name: string]: any};
}

export class TaskLog extends DataProto {
    log: {[id: string]: {[name: string]: any}};   // Used to recorder the desired result of task
    

    constructor(isInit: boolean, pkg?: TaskLogMemory) {
        super();
        if (isInit) {
            this.log = {};
        } else {
            this.unzip(pkg);
        }
    }

    zip(): TaskLogMemory {
        return this.log;
    }

    unzip(pkg: TaskLogMemory) {
        for (let id in pkg) {
            this.log[id] = pkg[id];
        }
    }

    // Return an unique id
    addTask(id: string, data: any) {
        this.log[id] = data;
    }

    // Deleted the task record
    delTask(id: number) {
        delete this.log[id];
    }
}