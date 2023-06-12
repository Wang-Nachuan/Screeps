import { TaskMemory, TaskFunction } from "../task";
import { Constant } from "@/constant";

export const TaskMove: TaskFunction = {

    init: function(owner: MemRef | null, targetId: string | null, pos: RoomPosition | null, range: number = 1): TaskMemory {
        let data: TaskMemory = {
            type: Constant.TASK_TYPE_MOVE,
            owner: owner,
            targetId: targetId,
            child: null,
            info: {
                pos: pos, 
                range: range
            }
        };
        return data;
    },

    exe: function(data: TaskMemory, creep: Creep): number {
        let pos: RoomPosition;
        if (data.targetId) {
            let target = Game.getObjectById(data.targetId);
            // Check terminate condition
            if (!target) {
                return Constant.TASK_RET_TARGET_LOST;
            }
            pos = target.pos;
        } else {
            pos = RoomPosition(data.info.pos.x, data.info.pos.y, data.info.pos.roomName);
        }
        // Check terminate condition
        if (creep.pos.inRangeTo(pos, data.info.range)) {
            return Constant.TASK_RET_FINISH;
        }
        creep.moveTo(pos, {reusePath: 5});
        creep.say('move');
        return Constant.TASK_RET_PROGRESS;
    },

    eval: function(data: TaskMemory, creep: Creep): number {
        let pos: RoomPosition;
        if (data.targetId) {
            let target = Game.getObjectById(data.targetId);
            pos = target.pos;
        } else {
            pos = RoomPosition(data.info.pos.x, data.info.pos.y, data.info.pos.roomName);
        }
        return -creep.pos.getRangeTo(pos);
    }
}