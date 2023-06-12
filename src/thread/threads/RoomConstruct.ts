import { ThreadMemory, ThreadFunction } from "../thread";

const STATE_INIT = 0

export const ThreadRoomConstruct: ThreadFunction = {
    init: function(roomName: string): ThreadMemory {
        let data: ThreadMemory = {
            type: "none",
            state: STATE_INIT,
            info: {roomName: roomName}
        }
        return data;
    },
    nextState: function(data: ThreadMemory): void {},
    nextAction: function(data: ThreadMemory): void {}
}