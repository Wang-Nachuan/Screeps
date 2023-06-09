import {Agent} from "./agent";
import {AgentPraetor} from "./instance/praetor";

export class Agents {

    static praetor(ref: MemRef, roomName: string) {
        return new AgentPraetor(true, ref, roomName);
    }

    static buildAgent(ref: MemRef, type: string): Agent {
        switch (type) {
            case 'praetor': {
                return new AgentPraetor(false, ref);
            }
            default: {}
        }
    }
}