import { ProcessData, ProcessFunction } from "../process";

const STATE_INIT = 0

export const processRoomManager: ProcessFunction = {
    init: (roomName: string) => {
        let data: ProcessData = {
            type: "none",
            state: STATE_INIT,
            threads: {},
            info: {roomName: roomName}
        }
        return data;
    },
    nextState: (data: ProcessData) => {},
    nextAction: (data: ProcessData) => {},
}