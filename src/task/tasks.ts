import {Task, TaskMemory} from './task';
import {TaskMoveTo} from './instances/moveTo';
import {TaskHarvest} from './instances/harvest';

export class Tasks {

    /**
     * pos: position to move to
     * range: range of valid area
     */
    static moveTo(pos: RoomPosition, range: number): Task {
        return new TaskMoveTo(true, {pos: pos, range: range});
    }

    /**
     * target: structure to store energy/resource
     * source: source/mineral/deposite object
     * srcType: type of resource
     * isOC: true - the creep will stands on a container and harvest continuously
     */
    static harvest(target: Structure, source: Source | Mineral | Deposit, srcType: string, isOC: boolean, amount?: number): Task {
        return new TaskHarvest(true, {target: target, source: source, srcType: srcType, isOC: isOC, amount: amount});
    }

    static buildTask(pkg: TaskMemory): Task {
        return /*TODO*/;
    }

}