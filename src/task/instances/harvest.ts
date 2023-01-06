import {Task, TaskMemory} from "../Task";
import {Tasks} from "../tasks";

export class TaskHarvest extends Task {
    readonly type: string = 'harvest';

    readonly MOVE_TO_SOURCE = 0;
    readonly HARVEST = 1;
    readonly MOVE_TO_TARGET = 2;
    readonly STORE = 3;

    constructor(isInit: boolean, 
        opt?: {
            pkg?: TaskMemory, 
            taskId?: string,
            owner?: {
                isAgent: boolean,
                ref: MemRef | Id<_HasId>
            }
            target?: Source | Mineral | Deposit, 
            srcType?: string,
            isOC?: boolean,
            amount?: number
        }
    ) {
        super(isInit, opt);
        if (isInit) {
            this.data.srcType = opt.srcType;
            this.data.isOC = opt.isOC;
            this.data.stage = this.MOVE_TO_SOURCE;
            if (opt.amount) {
                this.data.tarAmount = opt.amount;   // Target amount
                this.data.curAmount = 0;    // Finished amount
                this.data.preSt = 0;       // Amount of resource stored in creep in last tick 
                this.data.isTr = false;     // True if creep perform a transfer in last tick
            }
        }
    }

    work(creep: Creep): number {
        // Check object
        if (!creep) {
            return this.RET_HALT;
        }
        // Check target
        if (!this.target) {
            return this.RET_HALT;
        }
        // Update process
        if (this.data.isTr) {
            this.data.isTr = false;
            this.data.curAmount += this.data.preSt - creep.store[this.data.srcType];
        }
        // Check terminate condition
        if (this.data.tarAmount) {
            if (this.data.curAmount >= this.data.tarAmount) {
                return this.RET_FINISH;
            }
        }
        // Harvest
        creep.say('Harvest');
        if (this.data.isOC) {
            // Move to target
            if (!creep.pos.inRangeTo(this.target, 0)) {
                this.child = Tasks.moveTo(null, null, this.target.pos, 0);
                return this.RET_OK;
            }
            // Keep harvesting
            creep.harvest(this.target);
        } else {
            switch (this.data.stage) {
                case this.MOVE_TO_SOURCE: {
                    // If half empty, go to source, otherwise go to owner first
                    if (creep.store[this.data.srcType]/creep.store.getCapacity(this.data.srcType) < 0.5) {
                        if (!creep.pos.inRangeTo(this.target, 1)) {
                            this.child = Tasks.moveTo(null, null, this.target.pos, 1);
                            return this.RET_OK;
                        }
                        this.data.stage = this.HARVEST;
                    } else {
                        this.data.stage = this.MOVE_TO_TARGET;
                    }
                    break;
                }
                case this.HARVEST: {
                    if (creep.store.getFreeCapacity() > 0) {
                        creep.harvest(this.target);
                        return this.RET_OK;
                    }
                    this.data.stage = this.MOVE_TO_TARGET;
                    break;
                }
                case this.MOVE_TO_TARGET: {
                    if (!creep.pos.inRangeTo(this.owner, 1)) {
                        this.child = Tasks.moveTo(null, null, this.owner.pos, 1);
                        return this.RET_OK;
                    }
                    this.data.stage = this.STORE;
                    break;
                }
                case this.STORE: {
                    creep.transfer(this.owner, this.data.srcType);
                    this.data.stage = this.MOVE_TO_SOURCE;
                    this.data.preSt = creep.store[this.data.srcType];
                    this.data.isTr = true;
                    break;
                }
            }
            return this.RET_OK;
        }
    }

    eval(creep: Creep): number {
        if (creep.store[this.data.srcType]/creep.store.getCapacity(this.data.srcType) < 0.5) {
            return -creep.pos.getRangeTo(this.target);
        } else {
            return -creep.pos.getRangeTo(this.owner);
        }
    }
}