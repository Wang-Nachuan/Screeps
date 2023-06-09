import { ThreadData, Thread } from "@/thread/thread";
import { processRoomManager } from "./processes/RoomManager";

export interface ProcessData{
    type: string;
    state: number;
    threads: {[name: string]: ThreadData};
    info: {[name: string]: any};
}

export interface ProcessFunction {
    init: (...args: any) => ProcessData;
    nextState: (data: ProcessData) => void;
    nextAction: (data: ProcessData) => void;
}

// Collection of user interface
export const Process = {
    init: {
        RoomManager: processRoomManager.init
    },
    exe: (data: ProcessData) => {
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
    RoomManager: processRoomManager
}