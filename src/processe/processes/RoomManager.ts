import { ProcessMemory, ProcessFunction } from "../process";

const STATE_INIT = 0

export const ProcessRoomManager: ProcessFunction = {
    init: function(roomName: string): ProcessMemory {
        let data: ProcessMemory = {
            type: "none",
            state: STATE_INIT,
            threads: {},
            info: {roomName: roomName}
        }
        return data;
    },
    nextState: function(data: ProcessMemory): void {},
    nextAction: function(data: ProcessMemory): void {}
}