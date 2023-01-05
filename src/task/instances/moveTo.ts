import {Task, TaskMemory} from "../Task";

export class TaskMoveTo extends Task {
    readonly type: string = 'moveTo';

    constructor(isInit: boolean, 
        opt?: {pkg?: TaskMemory, pos?: RoomPosition, range?: number}) 
    {
        super(isInit, opt);    // Just let fields remains undefined
        if (isInit) {
            this.data.pos = opt.pos;
            this.data.range = opt.range;
        }
    }

    work(creep: Creep): number {
        // Check object
        if (!creep) {
            return this.RET_HALT;
        }
        // Check terminate condition
        let pos = new RoomPosition(this.data.pos.x, this.data.pos.y, this.data.pos.roomName);
        if (creep.pos.inRangeTo(pos, this.data.range)) {
            return this.RET_FINISH;
        }
        // Move
        creep.moveTo(pos, {reusePath: 5});
        return this.RET_OK;
    }
}