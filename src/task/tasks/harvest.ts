import { TaskMemory, TaskFunction, Task } from "../task";
import { Constant } from "@/constant";

const STATE_MOVE_TO_TARGET = 0;
const STATE_HARVEST = 1;
const STATE_MOVE_TO_OWNER = 2;
const STATE_STORE = 3;

export const TaskHarvest: TaskFunction = {

    init: function(owner: MemRef, targetId: string, srcType: string, srcAmount: number): TaskMemory {
        let data: TaskMemory = {
            type: Constant.TASK_TYPE_HARVEST,
            owner: owner,
            targetId: targetId,
            child: null,
            info: {
                srcType: srcType,       // Resource type
                tarAmount: srcAmount,   // Amount of resource to be harvested
                curAmount: 0,           // Amount of resource harvested
                preAmount: 0,           // Amount of resource stored in creep in previous tick
                state: STATE_MOVE_TO_TARGET,
                preTrans: false,        // Whether creep transfered resource to owner in previous tick
            }
        };
        // Increment attach number of target resource
        let target: Source | Mineral | Deposit = Game.getObjectById(targetId);
        Memory.room[target.room.name].source[targetId].attach += 1;
        return data;
    },

    exe: function(data: TaskMemory, creep: Creep): number {
        let target = Game.getObjectById(data.targetId);
        let owner = Game.getObjectById(derefMem(data.owner).id);
        // Check exceptions
        if (!owner) {
            return Constant.TASK_RET_OWNER_LOST;
        }
        if (!target) {
            return Constant.TASK_RET_TARGET_LOST;
        }
        // Update progress
        if (data.info.preTrans) {
            data.info.preTrans = false;
            data.info.curAmount += data.info.preAmount - creep.store[data.info.srcType];
        }
        // Check terminate condition
        if (data.info.curAmount >= data.info.tarAmount) {
            return Constant.TASK_RET_FINISH;
        }
        // Execute task
        switch (data.info.state) {
            case STATE_MOVE_TO_TARGET: {
                // If half empty, move to target, otherwise move to owner
                if (creep.store[data.info.srcType] / creep.store.getCapacity(data.info.srcType) < 0.5) {
                    // Move to target
                    if (!creep.pos.inRangeTo(target, 1)) {
                        data.child = Task.init.move(null, target.id, null, 1);
                        return Constant.TASK_RET_PROGRESS;
                    }
                    this.info.state = STATE_HARVEST;
                } else {
                    if (!creep.pos.inRangeTo(owner, 1)) {
                        data.child = Task.init.move(null, owner.id, null, 1);
                        this.info.state = STATE_MOVE_TO_OWNER;
                        return Constant.TASK_RET_PROGRESS;
                    }
                    this.info.state = STATE_STORE;
                }
                return Constant.TASK_RET_PROGRESS;
            }
            case STATE_HARVEST: {
                if (creep.store.getFreeCapacity() > 0) {
                    creep.harvest(target);
                    return Constant.TASK_RET_PROGRESS;
                }
                this.info.state = STATE_MOVE_TO_OWNER;
                return Constant.TASK_RET_PROGRESS;
            }
            case STATE_MOVE_TO_OWNER: {
                if (!creep.pos.inRangeTo(owner, 1)) {
                    data.child = Task.init.move(null, owner.id, null, 1);
                    return Constant.TASK_RET_PROGRESS;
                }
                this.info.state = STATE_STORE;
                return Constant.TASK_RET_PROGRESS;
            }
            case STATE_STORE: {
                creep.transfer(owner, data.info.srcType);
                data.info.preTrans = true;
                data.info.preAmount = creep.store[data.info.srcType];
                data.info.state = STATE_MOVE_TO_TARGET;
                return Constant.TASK_RET_PROGRESS;
            }
        }
    },

    eval: function(data: TaskMemory, creep: Creep): number {
        let target = Game.getObjectById(data.targetId);
        let owner = Game.getObjectById(derefMem(data.owner).id);
        if (creep.store[data.info.srcType] / creep.store.getCapacity(data.info.srcType) < 0.5) {
            return -creep.pos.getRangeTo(target);
        } else {
            return -creep.pos.getRangeTo(owner);
        }
    }
}