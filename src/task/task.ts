import { TaskMove } from "./tasks/move";
import { Constant } from "@/constant";

export interface TaskLog {

}

export interface TaskMemory{
    type: string;
    owner: MemRef;                  // Memory address of thread/process
    targetId: string | null;        // ID of target object
    child: TaskMemory | null;       // Child taks will be executed first
    info: {[key: string]: any};
}

export interface TaskFunction {

    /**
     * Initalized and return a TaskMemory object
     * 
     * @param owner Point to an object that publish the task, must contain a task log field and a ID field
     * @param targetId ID of target object, give null if not needed
     * @param args Other inputs required by different taskss
     */
    init(owner: MemRef, targetId: string | null, ...args: any): TaskMemory;                 // Create a new task

    /**
     * Execute the task
     * 
     * @param data TaskMemory object
     * @param creep Creep object
     */
    exe(data: TaskMemory, creep: Creep): number;

    /**
     * Provide a preference number for scheduler, a large number means the creep is prefered by the task
     * 
     * @param data TaskMemory object
     * @param creep Creep object
     */
    eval(data: TaskMemory, creep: Creep): number;
}

// Wrapper functions
export const Task = {
    
    init: {
        move: TaskMove.init
    },

    /**
     * Execute the task
     * 
     * @param data TaskMemory object
     * @param creep Creep object
     */
    exe: function(data: TaskMemory, creep: Creep): number {
        let ret: number;
        // Execute child task first
        if (data.child) {
            ret = Task.exe(data.child, creep);
            switch (ret) {
                case Constant.TASK_RET_FINISH: {
                    data.child = null;
                    break;
                }
                default: {
                    return ret;
                }
            }
        }
        ret = funcTable[data.type].exe(data, creep);
        switch (ret) {
            case Constant.TASK_RET_FINISH: {
                // Remove task from task log
                let taskLog = derefMem(data.owner).taskLog;
                delete taskLog;
                return Constant.TASK_RET_FINISH;
            }
            default: {
                return ret;
            }
        }
    },

    /**
     * Provide a preference number for scheduler, a large number means the creep is prefered by the task
     * 
     * @param data TaskMemory object
     * @param creep Creep object
     */
    eval: function(data: TaskMemory, creep: Creep): number {
        return funcTable[data.type].eval(data, creep);
    }
}

const funcTable = {
    move: TaskMove
}