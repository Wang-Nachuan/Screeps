import { threadRoomConstruct } from "./threads/RoomConstruct";

export interface ThreadData{
    type: string;
    state: number;
    info: {[name: string]: any};
}

export interface ThreadFunction {
    init: (...args: any) => ThreadData;
    nextState: (data: ThreadData) => void;
    nextAction: (data: ThreadData) => void;
}

// Collection of user interface
export const Thread = {
    init: {
        RoomConstruct: threadRoomConstruct.init
    },
    exe: (data: ThreadData): void => {
        let func = funcTable[data.type];
        func.nextState(data);
        func.nextAction(data);
    }
}

// Collection of ThreadFunction instances
const funcTable = {
    RoomConstruct: threadRoomConstruct
}