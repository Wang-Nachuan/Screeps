import { ThreadData, ThreadFunction } from "../thread";

const STATE_INIT = 0

export const threadRoomConstruct: ThreadFunction = {
    init: (roomName: string) => {
        let data: ThreadData = {
            type: "none",
            state: STATE_INIT,
            info: {roomName: roomName}
        }
        return data;
    },
    nextState: (data: ThreadData) => {},
    nextAction: (data: ThreadData) => {},
}