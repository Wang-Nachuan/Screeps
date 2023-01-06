import {Task, TaskMemory} from './task';
import {TaskMoveTo} from './instances/moveTo';
import {TaskHarvest} from './instances/harvest';

export class Tasks {

    /**
     *  pos: position to move to
     *  range: range of valid area
     */
    static moveTo(taskId: string, pos: RoomPosition, range: number): Task {
        return new TaskMoveTo(true, {taskId: taskId, pos: pos, range: range});
    }

    /**
     *  target: structure to store energy/resource
     *  source: source/mineral/deposite object
     *  srcType: type of resource
     *  isOC: true - the creep will stands on a container and harvest continuously
     */
    static harvest(taskId: string, target: Structure, source: Source | Mineral | Deposit, srcType: string, isOC: boolean, amount?: number): Task {
        return new TaskHarvest(true, {taskId: taskId, target: target, source: source, srcType: srcType, isOC: isOC, amount: amount});
    }

    /**
     *  pkg: zipped package in memory
     */
    static buildTask(pkg: TaskMemory): Task {
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