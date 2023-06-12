import { ThreadMemory, Thread } from "@/thread/thread";
import { ProcessRoomManager } from "./processes/RoomManager";

export interface ProcessMemory{
    type: string;
    state: number;
    threads: {[name: string]: ThreadMemory};
    info: {[key: string]: any};
}

export interface ProcessFunction {
    init(...args: any): ProcessMemory;
    nextState(data: ProcessMemory): void;
    nextAction(data: ProcessMemory): void;
}

// Collection of user interface
export const Process = {
    init: {
        RoomManager: ProcessRoomManager.init
    },
    exe: function(data: ProcessMemory): void {
        let func = funcTable[data.type];
        func.nextState(data);
        func.nextAction(data);
        for (let key in data.threads) {
            Thread.exe(data.threads[key]);
        }
    },
}

// Collection of ProcessFunction instances
const funcTable = {
    RoomManager: ProcessRoomManager
}