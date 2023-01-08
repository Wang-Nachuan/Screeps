/**
 *  Every task publisher should maintain a task log 
 */

import {DataProto} from "../protos";

export interface TaskLogMemory {
    [id: string]: {
        state: number;
        data: {[name: string]: any};
    };
}

export class TaskLog extends DataProto {
    log: any; 

    readonly STATE_UNFINISH = 0;
    readonly STATE_FINISH = 1;
    readonly STATE_HALT = 2;
    
    constructor(isInit: boolean, pkg?: TaskLogMemory) {
        super();
        if (isInit) {
            this.log = {};
        } else {
            this.unzip(pkg);
        }
    }

    zip(): any {
       return this.log;
    }

    unzip(pkg: any) {
        this.log = {};
        for (let id in pkg) {
            this.log[id] = pkg[id];
        }
    }

    addTask(id: string, data: any) {
        this.log[id] = {
            state: this.STATE_UNFINISH,
            data: data
        };
    }

    haltTask(id: string) {
        this.log[id].state = this.STATE_HALT;
    }

    finishTask(id: string) {
        this.log[id].state = this.STATE_FINISH;
    }

    isTaskHalt(id: string) {
        return this.log[id].state == this.STATE_HALT;
    }

    isTaskFinish(id: string) {
        return this.log[id].state == this.STATE_FINISH;
    }

    delTask(id: string) {
        delete this.log[id];
    }

    cleanAll() {
        this.log = {};
    }
}