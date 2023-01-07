import {StructureWrapper} from "./struct";
import {Tasks} from "../task/tasks";
import {CreepWrapper} from "../creep/creep";

export interface SpawnRequest {
    n: string;      // Name
    r: string;      // Role
    b: {[name: string]: number};    // Body
    ti: number;     // Time
    e: number;      // Energy
}

export class SpawnWrapper extends StructureWrapper {

    constructor(isInit: boolean, ref: MemRef,
        opt?: {id?: Id<_HasId>, type?: string})
    {
        super(isInit, ref, opt);
        if (isInit) {
            this._data.queue = Array<SpawnRequest>;
            this._data.rTime = 0;   // Remaining time to finish all spawn request
            this._data.curReq = null;
        }
    }

    addSpawnReq(role: string, body: {[name: string]: number}) {
        let time = 0;
        let energy = 0;
        for (let i in body) {
            time += body[i] * 3;
            switch (i) {
                case MOVE: {
                    energy += body[i] * 50;
                    break;
                }
                case WORK: {
                    energy += body[i] * 100;
                    break;
                }
                case CARRY: {
                    energy += body[i] * 50;
                    break;
                }
                case ATTACK: {
                    energy += body[i] * 80;
                    break;
                }
                case RANGED_ATTACK: {
                    energy += body[i] * 150;
                    break;
                }
                case HEAL: {
                    energy += body[i] * 250;
                    break;
                }
                case CLAIM: {
                    energy += body[i] * 600;
                    break;
                }
                case TOUGH: {
                    energy += body[i] * 10;
                    break;
                }
            }
        }
        this._data.queue.push({n: null, r: role, b: body, ti: time, e: energy});
        this._data.rTime += time;
    }

    protected spawn(req: SpawnRequest): number {
        let body = [];
        for (let bodyType of [TOUGH, CARRY, WORK, ATTACK, RANGED_ATTACK, HEAL, CLAIM, MOVE]) {
            if (req.b[bodyType]) {
                for (let i=0; i<req.b[bodyType]; i++) {
                    body.push(bodyType);
                }
            }
        }  
        return this.obj.spawnCreep(body, req.n);
    }

    work() {
        if (this.taskLog.log['harvest']) {
            if (this.taskLog.isTaskHalt('harvest') || this.taskLog.isTaskFinish('harvest')) {
                this.taskLog.delTask('harvest');
            }
        } else {
            // Require energy
            let free = this.obj.store.getFreeCapacity();
            if (free > 0) {
                let taskId = 'harvest';
                let task = Tasks.harvest(
                    {isAgent: false, ref: this.obj.id}, 
                    taskId, 
                    this.obj.room.find(FIND_SOURCES)[0],
                    RESOURCE_ENERGY,
                    false,
                    free
                )
                this.taskLog.addTask(taskId, null)
                this.roomTaskFlows['worker'].pubTask(task);
            }
        }
        if (!this.obj.spawning) {
            // Record the spawned creep
            if (this._data.curReq) {
                let creep = Game.creeps[this._data.curReq.n];
                this.roomTaskFlows[this._data.curReq.r].addReceiver(new CreepWrapper(true, creep.id, {role: this._data.curReq.r}));
                this._data.rTime -= this._data.curReq.ti;
                this._data.curReq = null;
            }
            // Spawn a creep
            let idx = -1;
            for (let i=0; i<this._data.queue.length; i++) {
                let req = this._data.queue.length[i];
                if (req.e > this.obj.room.energyAvailable) {
                    continue;
                }
                req.n = getCreepName(this.obj.room.name, req.r);
                this.spawn(req);
                this._data.curReq = req;
                idx = i;
                break;
            }
            // Delete request in the queue
            if (idx != -1) {
                this._data.queue.splice(idx, 1);
            }
        }
    }
}