import { ThreadRoomConstruct } from "./threads/RoomConstruct";

export interface ThreadMemory{
    type: string;
    state: number;
    info: {[key: string]: any};
}

export interface ThreadFunction {
    init(...args: any): ThreadMemory;
    nextState(data: ThreadMemory): void;
    nextAction(data: ThreadMemory): void;
}

// Wrapper functions
export const Thread = {
    init: {
        RoomConstruct: ThreadRoomConstruct.init
    },
    exe: function(data: ThreadMemory): void {
        let func = funcTable[data.type];
        func.nextState(data);
        func.nextAction(data);
    }
}

// Collection of ThreadFunction instances
const funcTable = {
    RoomConstruct: ThreadRoomConstruct
}