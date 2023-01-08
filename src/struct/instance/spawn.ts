import {StructureWrapper} from "../struct";
import {Tasks} from "../../task/tasks";
import {CreepWrapper} from "../../creep/creep";

export interface SpawnRequest {
    n: string;      // Name
    r: string;      // Role
    b: Array<number>;   // Body
    ti: number;     // Time
    e: number;      // Energy
}

export class SpawnWrapper extends StructureWrapper {

    constructor(isInit: boolean, ref: MemRef,
        opt?: {id?: Id<_HasId>})
    {
        super(isInit, ref, opt);
        if (isInit) {
            this.data.queue = [];
            this.data.rTime = 0;   // Remaining time to finish all spawn request
            this.data.curReq = null;
            this.writeBack();
        }
    }

    addSpawnReq(role: string, body: {[name: string]: number}) {
        let time = 0;
        let energy = 0;
        let _body = [0, 0, 0, 0, 0, 0, 0, 0];
        for (let i in body) {
            time += body[i] * 3;
            switch (i) {
                case TOUGH: {
                    energy += body[i] * 10;
                    _body[0] = body[i];
                    break;
                }
                case CARRY: {
                    energy += body[i] * 50;
                    _body[1] = body[i];
                    break;
                }
                case WORK: {
                    energy += body[i] * 100;
                    _body[2] = body[i];
                    break;
                }
                case ATTACK: {
                    energy += body[i] * 80;
                    _body[3] = body[i];
                    break;
                }
                case RANGED_ATTACK: {
                    energy += body[i] * 150;
                    _body[4] = body[i];
                    break;
                }
                case HEAL: {
                    energy += body[i] * 250;
                    _body[5] = body[i];
                    break;
                }
                case CLAIM: {
                    energy += body[i] * 600;
                    _body[6] = body[i];
                    break;
                }
                case MOVE: {
                    energy += body[i] * 50;
                    _body[7] = body[i];
                    break;
                }
            }
        }
        this.data.queue.push({n: null, r: role, b: _body, ti: time, e: energy});
        this.data.rTime += time;
    }

    protected spawn(req: SpawnRequest): number {
        let body = [];
        let bodyOrder = [TOUGH, CARRY, WORK, ATTACK, RANGED_ATTACK, HEAL, CLAIM, MOVE];
        for (let i=0; i<8; i++) {
            for (let num=0; num<req.b[i]; num++) {
                body.push(bodyOrder[i]);
            }
        }
        // for (let bodyType of [TOUGH, CARRY, WORK, ATTACK, RANGED_ATTACK, HEAL, CLAIM, MOVE]) {
        //     if (req.b[bodyType]) {
        //         for (let i=0; i<req.b[bodyType]; i++) {
        //             body.push(bodyType);
        //         }
        //     }
        // }  
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
                this.roomTaskFlow['worker'].pubTask(task);
            }
        }
        if (!this.obj.spawning) {
            // Record the spawned creep
            if (this.data.curReq) {
                let creep = Game.creeps[this.data.curReq.n];
                this.roomTaskFlow[this.data.curReq.r].addReceiver(new CreepWrapper(true, creep.id, {role: this.data.curReq.r}));
                this.data.rTime -= this.data.curReq.ti;
                this.data.curReq = null;
            }
            // Spawn a creep
            let idx = -1;
            for (let i=0; i<this.data.queue.length; i++) {
                let req = this.data.queue[i];
                if (req.e > this.obj.room.energyAvailable) {
                    continue;
                }
                req.n = getCreepName(this.obj.room.name, req.r);
                this.spawn(req)
                console.log('[1.1]', this._isWritten);
                this.data.curReq = req;
                this._isWritten = true;
                console.log('[1.2]', this._isWritten);
                idx = i;
                break;
            }
            // Delete request in the queue
            if (idx != -1) {
                this.data.queue.splice(idx, 1);
            }
        }
        
    }
}