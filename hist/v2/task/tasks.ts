import {Task, TaskMemory} from './task';
import {TaskMoveTo} from './instances/moveTo';
import {TaskHarvest} from './instances/harvest';

export class Tasks {

    /**
     *  owner: task owner, can be null
     *  taskId: unique task identifer of task publisher
     *  pos: position to move to
     *  range: range of valid area
     */
    static moveTo(owner: {isAgent: boolean, ref: MemRef | Id<_HasId>}, taskId: string, pos: RoomPosition, range: number): Task {
        return new TaskMoveTo(true, {owner: owner, taskId: taskId, pos: pos, range: range});
    }

    /**
     *  owner: task owner, can be null
     *  taskId: unique task identifer of task publisher
     *  target: structure to store energy/resource
     *  srcType: type of resource
     *  isOC: true - the creep will stands on a container and harvest continuously
     */
    static harvest(owner: {isAgent: boolean, ref: MemRef | Id<_HasId>}, taskId: string, target: Source | Mineral | Deposit, srcType: string, isOC: boolean, amount?: number): Task {
        return new TaskHarvest(true, {owner: owner, taskId: taskId, target: target, srcType: srcType, isOC: isOC, amount: amount});
    }

    /**
     *  pkg: zipped package in memory
     */
    static buildTask(pkg: any): Task {
        if (!pkg) {
            return null;
        }
        switch (pkg.t) {
            case 'moveTo': {
                return new TaskMoveTo(false, {pkg: pkg});
            }
            case 'harvest': {
                return new TaskHarvest(false, {pkg: pkg});
            }
            default: {
                return null;
            }
        }
    }

}